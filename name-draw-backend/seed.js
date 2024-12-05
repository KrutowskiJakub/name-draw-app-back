const mongoose = require("mongoose");

const MONGO_URI = "mongodb+srv://kubakrutowski:1234@cluster1.goage.mongodb.net/name_draw?retryWrites=true&w=majority";


// Define the schema for names
const nameSchema = new mongoose.Schema({
    name: String,
    isDrawn: { type: Boolean, default: false },
    marriage: String, // Add this field
});


// Create a model for names
const Name = mongoose.model("Name", nameSchema);

// Connect to MongoDB and seed data
mongoose
    .connect(MONGO_URI)
    .then(async () => {
        console.log("Connected to MongoDB");

        // Clear the collection to avoid duplicates
        await Name.deleteMany();

        // Insert names with marriage restrictions
        const names = [
            { name: "Anna", isDrawn: false, marriage: "Łukasz" },
            { name: "Łukasz", isDrawn: false, marriage: "Anna" },
            { name: "Aga", isDrawn: false, marriage: "Tomek" },
            { name: "Tomek", isDrawn: false, marriage: "Aga" },
            { name: "Zofia", isDrawn: false, marriage: "Marcin" },
            { name: "Marcin", isDrawn: false, marriage: "Zofia" },
            { name: "Piotr", isDrawn: false, marriage: "Maria" },
            { name: "Maria", isDrawn: false, marriage: "Piotr" },
        ];

        await Name.insertMany(names);
        console.log("Names seeded successfully!");

        // Close the connection
        mongoose.connection.close();
    })
    .catch((err) => {
        console.error("Error connecting to MongoDB:", err);
    });

