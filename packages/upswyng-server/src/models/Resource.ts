/**
 * Schema, accessor methods, and mutation methods for an entity which
 * represents a resource for a person experiencing homelessness. Users of
 * `Resource` should only be interacting with `TResource` and `TLegacyResource`;
 * the internal schema is abstracted away by the logic in this module.
 */
import {
  TLegacyResource,
  TResource,
  TAddress,
  TCloseSchedule,
  TSchedule,
  TSubcategory,
} from "@upswyng/upswyng-types";
import { userDocumentToUser, TUserDocument } from "./User";
import {
  TSubcategoryDocument,
  subcategoryDocumentToSubcategory,
} from "./Subcategory";
import mongoose, { Document, Schema } from "mongoose";
import removeUndefinedFields from "../utility/removeUndefinedFields";
import { ObjectId } from "bson";

export interface TResourceDocument extends Document {
  _id: ObjectId; // this is the mongodb id of the record
  address: TAddress;
  closeSchedule: TCloseSchedule[];
  createdAt: Date;
  createdBy: TUserDocument | undefined; // always populate
  deleted: boolean;
  description: string;
  id: ObjectId; // this is canonical upswyng ID
  kudos: number;
  lastModifiedAt: Date;
  lastModifiedBy: TUserDocument | undefined; // always populate
  legacyId: string | null | undefined;
  location: { type: string; coordinates: number[] };
  name: string;
  phone: string;
  schedule: TSchedule[];
  services: string[];
  subcategories: ObjectId[] | TSubcategoryDocument[];
  website: string;
}

/**
 * Convert a resource document from the database into our `TResource` type.
 * Explicity enumerate keys so we make TypeScript happy.
 */
export const resourceDocumentToResource = (
  r: TResourceDocument
): TResource | null => {
  if (r.toObject) {
    r = r.toObject();
  } else {
    console.warn(
      `\`resourceDocumentToResource\` received resource which does not appear to be a Mongoose Document [${Object.keys(
        r
      )}]:\n${JSON.stringify(r, null, 2)}`
    );
  }
  const result = {
    _id: r._id.toHexString(),
    address: {
      address1: r.address.address1,
      address2: r.address.address2,
      city: r.address.city,
      state: r.address.state,
      zip: r.address.zip,
    },
    closeSchedule: r.closeSchedule,
    createdAt: r.createdAt,
    createdBy: r.createdBy ? userDocumentToUser(r.createdBy) : undefined,
    deleted: r.deleted,
    description: r.description,
    id: r.id.toHexString(),
    kudos: r.kudos,
    lastModifiedAt: r.lastModifiedAt,
    lastModifiedBy: r.lastModifiedBy
      ? userDocumentToUser((r.lastModifiedBy as unknown) as TUserDocument)
      : undefined,
    latitude: r.location ? r.location.coordinates[1] : null,
    legacyId: r.legacyId,
    longitude: r.location ? r.location.coordinates[0] : null,
    name: r.name,
    phone: r.phone,
    schedule: r.schedule,
    services: r.services,
    subcategories: (r.subcategories as any)
      .map(subcategoryDocumentToSubcategory)
      .filter(Boolean) as TSubcategory[],
    website: r.website,
  };

  removeUndefinedFields(result);
  return result;
};

export const ResourceSchema = new Schema({
  address /* TAddress */: {
    address1: String,
    address2: { type: String, required: false },
    city: String,
    state: String,
    zip: String,
  },
  closeSchedule /* TCloseSchedule[] */: [
    { day: String, period: String, scheduleType: String },
  ],
  createdAt: { type: Date, default: Date.now, required: true },
  createdBy: { type: Schema.Types.ObjectId, ref: "User", required: false },
  deleted: { type: Boolean, default: false, required: true },
  description: {
    type: String,
    required: false, // TODO: Make this required
  },
  id: {
    // This is the canonical ID for the resource and should be referenced in
    // other database entries, URLs, etc.
    type: Schema.Types.ObjectId,
    required: true,
    index: true,
    // unique in the `Resource` collection, but may not be unique
    // in the `DraftResource` collection
    unique: false,
  },
  kudos: { type: Number, default: 0 },
  lastModifiedAt: { type: Date, default: Date.now, required: true },
  lastModifiedBy: { type: Schema.Types.ObjectId, ref: "User", required: false },
  legacyId: { type: String, required: false, index: true },
  location: {
    // GeoJSON Point https://tools.ietf.org/html/rfc7946#section-3.1.2
    type: {
      type: String,
      enum: ["Point"],
      required: true,
    },
    coordinates: {
      type: [Number], // longitude, latitude
      required: true,
    },
  },
  name: { type: String, required: true, index: true },
  phone: String,
  schedule /* TSchedule[] */: [
    {
      day: {
        type: String,
        required: false,
        enum: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ],
      },
      date: {
        type: String,
        required: false,
      },
      period: {
        type: String,
        required: false,
        enum: ["Last", "First", "Second", "Third", "Fourth", "Fifth"],
      },
      from: {
        type: String,
        required: false,
      },
      to: {
        type: String,
        required: false,
      },
      scheduleType: {
        type: String,
        enum: ["Weekly", "Monthly", "Open 24/7", "Date Range"],
        required: true,
      },
    },
  ],
  services: [{ type: String, trim: true }],
  subcategories: [
    {
      type: Schema.Types.ObjectId,
      ref: "Subcategory",
    },
  ],
  website: String,
});

const trimQuotes = (s: string): string => {
  if (s[0] === '"' && s[s.length - 1] === '"') {
    return s.slice(1, -1);
  }
  return s;
};

const legacyResourceToResource = (
  r: TLegacyResource,
  createdAt: Date = new Date(),
  id?: string
): Omit<TResource, "_id"> => ({
  address: {
    address1: r.address1,
    address2: r.address2,
    city: r.city,
    state: r.state,
    zip: (r.zip || "").toString(),
  },
  closeSchedule: (r.closeschedule || []).map(i => ({
    day: i.day,
    date: i.date,
    period: i.period,
    from: i.fromstring,
    to: i.tostring,
    scheduleType: i.type,
  })),
  createdAt,
  deleted: (r.closeschedule || [])
    .map(item => item.type.toLowerCase())
    .includes("permanently closed"),
  description: trimQuotes(r.description),
  id: new ObjectId().toHexString(),
  kudos: r.kudos,
  lastModifiedAt:
    new Date(r.updateshelter) instanceof Date &&
    !isNaN(new Date(r.updateshelter).valueOf())
      ? new Date(r.updateshelter)
      : new Date(),
  latitude: r.lat,
  legacyId: id,
  longitude: r.lng,
  name: r.charityname,
  phone: r.phone,
  subcategories: [],
  schedule: (r.schedule || []).map(s => ({
    day: s.day,
    date: s.date,
    period: s.period,
    string: s.fromstring,
    to: s.tostring,
    scheduleType: s.type,
  })),
  services: r.servicetype.split(","),
  website: r.website,
});

export const resourceToSchema = (r: Partial<TResource>) => {
  const result = {
    ...r,
    id: ObjectId.createFromHexString(r.id),
    _id: ObjectId.createFromHexString(r._id),
  };
  delete result.latitude;
  delete result.longitude;
  return r.longitude && r.latitude
    ? {
        ...result,
        location: { type: "Point", coordinates: [r.longitude, r.latitude] },
      }
    : result;
};

/**
 * Takes a legacy object from Strappd and puts it into the database.
 * If the Resource already exists in the database, this will over write the entry if
 * the last modified time of the legacy object is newer than the last modified time
 * of our record.
 */
ResourceSchema.statics.addOrUpdateLegacyResource = async function(
  id: string,
  resource: TLegacyResource
): Promise<void> {
  const existingRecord = await this.findOne({ legacyId: id })
    .populate("createdBy")
    .populate("lastmodifiedBy");
  const self = this; // eslint-disable-line @typescript-eslint/no-this-alias
  if (!existingRecord) {
    const newRecord = new self(
      resourceToSchema(legacyResourceToResource(resource, new Date(), id))
    );
    await newRecord.save();
    return;
  }
  const newDate = resource.updateshelter
    ? new Date(resource.updateshelter)
    : /* a long time ago */ new Date("1975-01-01");
  if (newDate > existingRecord.lastModifiedAt) {
    // update the record and return the updated record
    existingRecord.set(
      resourceToSchema(legacyResourceToResource(resource, new Date(), id))
    );
    await existingRecord.save().then(resourceDocumentToResource);
  }
};

/**
 * Retrieve a resource by its ID. `null` if there is no matching Resource.
 */
ResourceSchema.statics.getById = async function(
  id: ObjectId
): Promise<TResourceDocument | null> {
  return await this.findOne({ id })
    .populate({ path: "subcategories", populate: { path: "parentCategory" } })
    .populate("createdBy")
    .populate("lastModifiedBy");
};

/**
 * Retrieve a resource by its record ID (_id). `null` if there is no matching Resource.
 */
ResourceSchema.statics.getByRecordId = async function(
  _id: ObjectId
): Promise<TResourceDocument | null> {
  return await this.findOne({ _id, deleted: false })
    .populate({ path: "subcategories", populate: { path: "parentCategory" } })
    .populate("createdBy")
    .populate("lastModifiedBy");
};

/**
 * Retrieve all resources.
 */
ResourceSchema.statics.getAll = async function(): Promise<TResourceDocument[]> {
  return await this.find({ deleted: false })
    .populate({ path: "subcategories", populate: { path: "parentCategory" } })
    .populate("createdBy")
    .populate("lastModifiedBy");
};

/**
 * Retrieve the resources which haven't assigned to at least one subcategory.
 */
ResourceSchema.statics.getUncategorized = async function(): Promise<
  TResourceDocument[]
> {
  return await this.find({
    "subcategories.0": { $exists: false },
    deleted: false,
  })
    .populate({ path: "subcategories", populate: { path: "parentCategory" } })
    .populate("createdBy")
    .populate("lastModifiedBy");
};

/**
 * Delete a resource by its record ID (_id).
 * @return {TResourceDocument} The deleted resource
 */
ResourceSchema.statics.deleteByRecordId = async function(
  id: ObjectId
): Promise<TResourceDocument> {
  return this.findByIdAndDelete(id)
    .populate({ path: "subcategories", populate: { path: "parentCategory" } })
    .populate("createdBy")
    .populate("lastModifiedBy");
};

const Resource = mongoose.model<TResourceDocument>("Resource", ResourceSchema);

(Resource as any).deleteByRecordId = () => {
  throw new Error(
    'Only drafts should be deleted. Once a resource is in the directory, set the "deleted" field on it to `true` instead of deleting from the database'
  );
};

// TODO: Disable once this gets too big
// (Resource as any).getAll = () => {
//   throw new Error(
//     "getAll can only be called on the Draft Resources collection."
//   );
// };

export default Resource as typeof Resource & {
  addOrUpdateLegacyResource: (
    id: string,
    resource: TLegacyResource
  ) => Promise<TResource>;
  getAll: () => Promise<TResource[]>;
  getById: (id: ObjectId) => Promise<TResource | null>;
  getByRecordId: (id: ObjectId) => Promise<TResource | null>;
  getUncategorized: () => Promise<TResource[]>;
};

const DraftResource = mongoose.model<TResourceDocument>(
  "DraftResource",
  ResourceSchema
) as typeof Resource & {
  addOrUpdateLegacyResource: (
    id: string,
    resource: TLegacyResource
  ) => Promise<void>;
  deleteByRecordId: (id: ObjectId) => Promise<TResourceDocument>;
  getById: (id: ObjectId) => Promise<TResourceDocument | null>;
  getByRecordId: (id: ObjectId) => Promise<TResourceDocument | null>;
  getAll: () => Promise<TResourceDocument[]>;
};

(DraftResource as any).getUncategorized = () => {
  throw new Error("getUncategorized can only be called on normal Resources");
};

export { DraftResource };
