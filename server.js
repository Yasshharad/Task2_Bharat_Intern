const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 4000;
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

mongoose.connection.on('connected', () => {
    console.log('Connected to MongoDB Atlas');
});

mongoose.connection.on('error', (err) => {
    console.error('Error connecting to MongoDB Atlas:', err);
});

const transactionSchema = new mongoose.Schema({
    description: String,
    amount: Number,
    type: { type: String, enum: ['income', 'expense'] },
    date: { type: Date, default: Date.now }
});

const Transaction = mongoose.model('Transaction', transactionSchema);

app.use(bodyParser.json());
app.use(cors());

app.get('/transactions', async (req, res) => {
    try {
        const { type, startDate, endDate } = req.query;
        const filter = {};

        if (type) {
            filter.type = type;
        }

        if (startDate && endDate) {
            filter.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
        }

        const transactions = await Transaction.find(filter);
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/transactions', async (req, res) => {
    const { id, description, amount, type } = req.body;

    try {
        let transaction;

        if (id) {
            transaction = await Transaction.findByIdAndUpdate(id, { description, amount, type }, { new: true });
        } else {
            transaction = new Transaction({ description, amount, type });
            await transaction.save();
        }

        res.status(201).json(transaction);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.delete('/transactions/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const deletedTransaction = await Transaction.findByIdAndDelete(id);

        if (deletedTransaction) {
            res.json({ message: 'Transaction deleted successfully' });
        } else {
            res.status(404).json({ error: 'Transaction not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.put('/transactions/:id', async (req, res) => {
    const { id } = req.params;
    const { description, amount, type } = req.body;

    try {
        const updatedTransaction = await Transaction.findByIdAndUpdate(id, { description, amount, type }, { new: true });

        if (updatedTransaction) {
            res.json(updatedTransaction);
        } else {
            res.status(404).json({ error: 'Transaction not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
