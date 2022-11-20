import mongoose from "mongoose";
import { Schema, Document } from "mongoose";
export interface oneResult extends Document {
  title: string;
  datePosted: Date;
  neighborhood: string;
  url: string;
  jobDescription: string;
  compensation: string;
}

const listingSchema = new Schema<oneResult>({
  title: String,
  datePosted: Date,
  neighborhood: String,
  url: String,
  jobDescription: String,
  compensation: String,
});

const Listing = mongoose.model("listings", listingSchema);

export default Listing;
