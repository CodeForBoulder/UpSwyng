import Grid from "@material-ui/core/Grid";
import { RRule } from "rrule";
import React from "react";
import { TScheduleItem } from "@upswyng/common";
import Typography from "@material-ui/core/Typography";
import { useTranslation } from "react-i18next";

export const days = {
  sunday: "SU",
  monday: "MO",
  tuesday: "TU",
  wednesday: "WE",
  thursday: "TH",
  friday: "FR",
  saturday: "SA",
};

const WeeklySchedule = ({ items }: { items: TScheduleItem[] }) => {
  const { t } = useTranslation(["glossary"]);

  const dayItemsMap = Object.entries(days).map(([label, key]) => {
    return {
      day: label,
      items: items.filter(item =>
        item.recurrenceRule.options.byweekday.includes(
          (RRule as any)[key]["weekday"]
        )
      ),
    };
  });

  return (
    <Grid container spacing={1}>
      {dayItemsMap
        .filter(x => x.items.length)
        .map(x => (
          <Grid item xs={12} key={x.day}>
            <Grid container spacing={6}>
              <Grid item xs={6}>
                <Typography component="h3" variant="subtitle1">
                  {t("weekdays." + x.day)}:
                </Typography>
              </Grid>
              <Grid item xs={6}>
                {x.items.map(i => (
                  <Typography key={`${i.fromTime.value}${i.toTime.value}`}>
                    {i.fromTime.label} - {i.toTime.label}
                  </Typography>
                ))}
              </Grid>
            </Grid>
          </Grid>
        ))}
    </Grid>
  );
};

export default WeeklySchedule;
