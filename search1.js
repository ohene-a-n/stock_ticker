const express = require('express');
const { MongoClient } = require('mongodb');

const app = express();
const port = 3000;
const uri = "mongodb+srv://OHENE_DB:OHENE_DB@cluster0.6vwqi.mongodb.net/Stock?retryWrites=true&w=majority&appName=Cluster0";

let client;

async function connectToMongoDB() {
    if (!client) {
        client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        await client.connect();
        console.log("Connected to MongoDB!");
    }
    const db = client.db("Stock");
    const collection = db.collection("PublicCompanies");
    return { client, collection };
}

app.use(express.urlencoded({ extended: true }));


app.get('/', async(req, res) => {
    fs.readFile('./index.html', 'utf8', (err, data) => {
        if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal server error');
        return;
        }
        else {
        res.write(data);
        }
    });
});



app.get('/process', async (req, res) => {
    const { query, queryType } = req.query;

    let results = [];
    try {
        const { collection } = await connectToMongoDB();

        if (queryType === 'ticker') {
            results = await collection.find({ Ticker: query }).toArray();
        } else if (queryType === 'company') {
            results = await collection.find({ Company: query }).toArray();
        }

        res.send(`
            <style>
                body {
                    font-family: 'Arial', sans-serif;
                    background-color: #f9f9f9;
                    margin: 0;
                    padding: 0;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 100vh;
                }
        
                .container {
                    max-width: 800px;
                    background: white;
                    box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
                    border-radius: 8px;
                    overflow: hidden;
                    padding: 20px;
                    text-align: center;
                }
        
                h2 {
                    color: #333;
                    margin-bottom: 20px;
                }
        
                .result {
                    font-size: 1rem;
                    color: #555;
                    line-height: 1.5;
                    padding: 10px 15px;
                    margin: 10px 0;
                    border: 1px solid #ddd;
                    border-radius: 6px;
                    text-align: left;
                    background-color: #f5f5f5;
                }
        
                .result b {
                    color: #007BFF;
                }
        
                .no-results {
                    font-size: 1.2rem;
                    color: #999;
                    margin-top: 20px;
                }
            </style>
            <div class="container">
                <h2>Search Results:</h2>
                <br>
                ${results.length ? results.map(stock => `
                    <div class="result">
                        Name: <b>${stock.Company}</b><br>
                        Ticker: <b>${stock.Ticker}</b><br>
                        Price: <b>$${stock.Price}</b>
                    </div>
                `).join('') : '<div class="no-results">No results found</div>'}
            </div>
        `); 
    } catch (err) {
        console.error('Error querying MongoDB:', err);
        res.status(500).send('<p>Internal server error. Please try again later.</p>');
    }
});

app.listen(port, () => {
    console.log(`Live!!`);
});
