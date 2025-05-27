import mongoose from 'mongoose';

const clinicSchema = new mongoose.Schema({
  name: { type: String, required: true },
  domain: { type: String, required: true, unique: true }, // e.g. "clinic1"
  plan: { type: String, default: 'free' },
  last_active_date: { type: Date, default: Date.now },
});

const Clinic = mongoose.model('Clinic', clinicSchema);

export default Clinic;
