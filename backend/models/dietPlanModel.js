const mongoose = require('mongoose');

const dietPlanSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    meals: [{
        type: String,
        required: true
    }],
    calories: {
        type: Number,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const DietPlan = mongoose.model('DietPlan', dietPlanSchema);

module.exports = DietPlan;