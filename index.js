require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json({ limit: "10kb" }));

const PORT = process.env.PORT || 3000;
const OFFICIAL_EMAIL = "prabhjot1591.be23@chitkara.edu.in";

/* ========== HELPER FUNCTIONS ========== */

function fibonacci(n) {
    let result = [];
    for (let i = 0; i < n; i++) {
        if (i === 0) result.push(0);
        else if (i === 1) result.push(1);
        else result.push(result[i - 1] + result[i - 2]);
    }
    return result;
}

function isPrime(num) {
    if (num < 2) return false;
    for (let i = 2; i * i <= num; i++) {
        if (num % i === 0) return false;
    }
    return true;
}

function gcd(a, b) {
    while (b !== 0) {
        [a, b] = [b, a % b];
    }
    return Math.abs(a);
}

function lcm(a, b) {
    return Math.abs(a * b) / gcd(a, b);
}

/* ========== HEALTH ROUTE ========== */

app.get("/health", (req, res) => {
    res.status(200).json({
        is_success: true,
        official_email: OFFICIAL_EMAIL
    });
});

/* ========== BFHL ROUTE ========== */

app.post("/bfhl", async (req, res) => {
    try {
        const body = req.body;
        const keys = Object.keys(body);

        if (keys.length !== 1) {
            return res.status(400).json({
                is_success: false
            });
        }

        const key = keys[0];
        const value = body[key];
        let data;

        switch (key) {
            case "fibonacci":
                if (typeof value !== "number" || value < 0)
                    return res.status(400).json({ is_success: false });
                data = fibonacci(value);
                break;

            case "prime":
                if (!Array.isArray(value))
                    return res.status(400).json({ is_success: false });
                data = value.filter(num => typeof num === "number" && isPrime(num));
                break;

            case "lcm":
                if (!Array.isArray(value) || value.length === 0)
                    return res.status(400).json({ is_success: false });
                data = value.reduce((a, b) => lcm(a, b));
                break;

            case "hcf":
                if (!Array.isArray(value) || value.length === 0)
                    return res.status(400).json({ is_success: false });
                data = value.reduce((a, b) => gcd(a, b));
                break;

       case "AI":
    if (typeof value !== "string" || value.trim() === "")
        return res.status(400).json({ is_success: false });

    const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
            contents: [
                {
                    parts: [{
                        text: `Answer in one word only. Do not explain. Question: ${value}`
                    }]
                }
            ]
        }
    );

    let rawText = response.data.candidates[0].content.parts[0].text.trim();

    // Remove punctuation and extra spaces
    rawText = rawText.replace(/[^a-zA-Z]/g, "");

    data = rawText;

    break;




            default:
                return res.status(400).json({ is_success: false });
        }

        return res.status(200).json({
            is_success: true,
            official_email: OFFICIAL_EMAIL,
            data
        });

    } catch (err) {
    console.error("AI ERROR:", err.response?.data || err.message);

    return res.status(500).json({
        is_success: false,
        error: err.response?.data || err.message
    });
}
});

module.exports = app;
