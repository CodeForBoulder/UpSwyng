import { ResourceSchedule, TScheduleItem } from "@upswyng/upswyng-core";
import Cache from "../../../utility/cache";
import { ObjectId } from "bson";
import Resource from "../../../models/Resource";
import moment from "moment";

interface TSchedulePeriod {
  open: Date;
  close: Date;
}

const cache = new Cache<TSchedulePeriod>();

const scheduleItemToPeriod = (item: TScheduleItem): TSchedulePeriod => {
  const dateFormat = "YYYY MM DD";
  const dateTimeFormat = `${dateFormat} HH:mm`;
  const itemDateString = moment(item.recurrenceRule.all()[0]).format(
    dateFormat
  );
  const periodOpen = moment(
    `${itemDateString} ${item.fromTime.value}`,
    dateTimeFormat
  );
  const periodClose = moment(
    `${itemDateString} ${item.toTime.value}`,
    dateTimeFormat
  );

  return {
    open: periodOpen.toDate(),
    close: periodClose.toDate(),
  };
};

const getNextSchedulePeriod = async (
  id: string
): Promise<Record<string, TSchedulePeriod>> => {
  const { schedule } = await Resource.getByResourceId(
    ObjectId.createFromHexString(id)
  );
  const scheduleItems = ResourceSchedule.parse(schedule).getItems();

  const nextSchedulePeriod = scheduleItems.reduce(
    (nextSchedule: TSchedulePeriod | null, currentSchedule: TScheduleItem) => {
      const currentPeriod = scheduleItemToPeriod(currentSchedule);
      if (!nextSchedule) {
        return currentPeriod;
      }

      const currentPeriodIsSooner =
        currentPeriod.open.getTime() < nextSchedule.open.getTime();

      return currentPeriodIsSooner ? currentPeriod : nextSchedule;
    },
    null
  );

  cache.setValue(id, nextSchedulePeriod);

  return { [id]: nextSchedulePeriod };
};

const getNextSchedulePeriods = (
  resourceIds: string[]
): Promise<Record<string, TSchedulePeriod>>[] => {
  const now = Date.now();

  const nextSchedulePeriods = resourceIds.map(id => {
    const cachedResourceSchedule = cache.getValue(id);
    if (
      cachedResourceSchedule &&
      cachedResourceSchedule.close.getTime() > now
    ) {
      return Promise.resolve({ [id]: cachedResourceSchedule });
    }

    return getNextSchedulePeriod(id);
  });

  return nextSchedulePeriods;
};

export const get = async (req, res, _next) => {
  const { resourceIds } = req.body;

  if (!resourceIds || !resourceIds.length) {
    res.writeHead(400, {
      "Content-Type": "application/json",
    });

    res.end(
      JSON.stringify({
        message: "Please provide resource ID(s)",
      })
    );
    return;
  }

  const schedulePeriods = await getNextSchedulePeriods(resourceIds).reduce(
    (acc, period) => ({
      ...acc,
      ...period,
    })
  );

  res.writeHead(200, {
    "Content-Type": "application/json",
  });

  res.end(JSON.stringify(schedulePeriods));
};
