import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Clinic from './models/Clinic.js';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  console.log('Connected to MongoDB');
  

  const newClinic = new Clinic({
    name: 'Ravi Hospital',
    domain: 'ravihospital',
    plan: 'basic',
    last_active_date: new Date(),
  });

  await newClinic.save();
  console.log('✅ Seeded ravi hospital successfully');
  process.exit();
})
.catch(err => {
  console.error('Error seeding clinic:', err);
  process.exit(1);
});
