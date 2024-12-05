const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// MongoDB Connection
const MONGO_URI = "mongodb+srv://kubakrutowski:1234@cluster1.goage.mongodb.net/name_draw?retryWrites=true&w=majority";

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

// Schema for Names
const nameSchema = new mongoose.Schema({
    name: String,
    isDrawn: { type: Boolean, default: false },
    marriage: String, // Add this field
});


const Name = mongoose.model("Name", nameSchema);

// API Routes
app.get("/api/names", async (req, res) => {
    const names = await Name.find({ isDrawn: false });
    res.json(names);
});


app.post("/api/draw", async (req, res) => {
    const { userName } = req.body;

    // Find the user in the database
    const user = await Name.findOne({ name: userName });
    if (!user) {
        return res.status(404).json({ message: "User not found!" });
    }

    // Debug user and marriage field
    console.log("User:", user);
    console.log("Marriage field:", user.marriage);

    // Fetch eligible names
    const excludedNames = [userName, user.marriage];
    console.log("Excluding names:", excludedNames);

    const eligibleNames = await Name.find({
        isDrawn: false,
        name: { $nin: excludedNames },
    });

    console.log("Eligible names:", eligibleNames);

    if (eligibleNames.length === 0) {
        return res.status(400).json({ message: "No eligible names left to draw!" });
    }

    // Randomly select a name
    const randomIndex = Math.floor(Math.random() * eligibleNames.length);
    const drawnName = eligibleNames[randomIndex];

    // Mark the selected name as drawn
    drawnName.isDrawn = true;
    await drawnName.save();

    res.json({ drawnName: drawnName.name });
});




app.post("/seed", async (req, res) => {
    try {
        // Clear the collection
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
        res.status(200).send("Database seeded successfully!");
    } catch (error) {
        console.error(error);
        res.status(500).send("Failed to seed database");
    }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
