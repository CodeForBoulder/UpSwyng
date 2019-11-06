import { ObjectId } from "bson";
import { TCategoryDocument, categoryDocumentToCategory } from "./Category";
import { TResourceDocument, resourceDocumentToResource } from "./Resource";
import { TSubcategory } from "@upswyng/upswyng-types";
import mongoose, { Schema, Document } from "mongoose";
import removeUndefinedFields from "../utility/removeUndefinedFields";

export interface TSubcategoryDocument extends Document {
  _id: ObjectId;
  createdAt: Date;
  lastModifiedAt: Date;
  name: string;
  parentCategory: TCategoryDocument; // we always call `populate` on parent category
  resources: ObjectId[] | TResourceDocument[];
  stub: string;
}

export function subcategoryDocumentToSubcategory(
  d: TSubcategoryDocument
): TSubcategory {
  let s = d;
  if (d.toObject()) {
    s = d.toObject();
  } else {
    console.warn(
      `\`subcategoryDocumentToSubcategory\` recieved subcategory which does not appear to be a Mongoose Document:\n${JSON.stringify(
        d,
        null,
        2
      )})`
    );
  }
  let result: TSubcategory;
  if (!s.resources.length) {
    // we have don't care what type of resources we have
    result = {
      ...s,
      _id: s._id.toHexString(),
      parentCategory: categoryDocumentToCategory(s.parentCategory),
      resources: [],
    };
  } else if (s.resources[0].hasOwnProperty("_id")) {
    // we have TResourceDocuments for Resources
    result = {
      ...s,
      _id: s._id.toHexString(),
      parentCategory: categoryDocumentToCategory(s.parentCategory),
      resources: (s.resources as TResourceDocument[]).map(
        resourceDocumentToResource
      ),
    };
  } else {
    // we have ObjectIds for Resources
    result = {
      ...s,
      _id: s._id.toHexString(),
      parentCategory: categoryDocumentToCategory(s.parentCategory),
      resources: undefined,
    };
    delete result.resources;
  }

  removeUndefinedFields(result);
  return result;
}

const SubcategorySchema = new Schema({
  name: { type: String, required: true },
  stub: {
    type: String,
    lowercase: true,
    required: true,
    trim: true,
    unique: true,
  },
  parentCategory: { type: Schema.Types.ObjectId, ref: "Category" },
  resources: [
    {
      // corresponds to the `Resource.id` (note: NOT `Resource._id`)
      type: Schema.Types.ObjectId,
      ref: "Resource",
    },
  ],
  createdAt: { type: Date, default: Date.now, required: true },
  lastModifiedAt: { type: Date, default: Date.now, required: true },
});

SubcategorySchema.statics.findOrCreate = async function(
  name: string,
  stub: string,
  parentCategoryId: Schema.Types.ObjectId
) {
  const result = await this.findOne({ name, stub, parentCategoryId }).populate(
    "parentCategory"
  );
  return result || new this({ name, stub, parentCategoryId });
};

SubcategorySchema.statics.getSubcategoryList = async function(
  includeResources = false
) {
  if (includeResources) {
    return await this.find()
      .populate("parentCategory")
      .populate("resources");
  }
  return await this.find()
    .populate("parentCategory")
    .map(r => {
      delete r.resources;
      return r;
    });
};

SubcategorySchema.statics.getByStub = async function(
  stub: string
): Promise<TSubcategoryDocument | null> {
  return await this.find({ stub })
    .populate("parentCategory")
    .populate("resources");
};

const Subcategory = mongoose.model<TSubcategoryDocument>(
  "Subcategory",
  SubcategorySchema
);

export default Subcategory as typeof Subcategory & {
  findOrCreate: (
    name: string,
    stub: string,
    parentCategoryId: ObjectId
  ) => Promise<TSubcategoryDocument>;
  getByStub: (stub: string) => Promise<TSubcategoryDocument | null>;
  getSubcategoryList: (
    includeResources?: boolean
  ) => Promise<TSubcategoryDocument[]>;
};
