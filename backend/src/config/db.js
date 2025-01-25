import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        await mongoose.connect("mongodb://localhost:27017/health_assistant", {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB connected');
    } catch (error) {
        console.error('Database connection failed:', error.message);
        process.exit(1);
    }
};

export default connectDB;
