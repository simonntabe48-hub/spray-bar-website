import express from 'express';
import cors from 'cors';

const app = express();

// 🔧 FIX 1: Tell the app to use Render's dynamic port, or 5174 if on your local computer
const PORT = process.env.PORT || 5174; 

// 🔧 FIX 2: Open CORS so your future live Website and WMS can talk to this API
app.use(cors());
app.use(express.json());

// --- IN-MEMORY DATABASE ---
let leads = [];
let jobs = [];

// --- API ENDPOINTS ---
app.post('/api/leads', (req, res) => {
    console.log("New booking received:", req.body);
    const newLead = {
        id: Date.now().toString(),
        ...req.body,
        status: 'New Lead',
        createdAt: new Date().toISOString()
    };
    leads.push(newLead);
    res.status(201).json({ message: "Booking successful!", lead: newLead });
});

app.get('/api/leads', (req, res) => {
    res.status(200).json(leads);
});

app.delete('/api/leads/:id', (req, res) => {
    leads = leads.filter(l => l.id !== req.params.id);
    res.status(200).json({ message: "Lead deleted successfully" });
});

app.listen(PORT, () => {
    console.log(`✅ Nexus Backend API is running on port ${PORT}`);
});