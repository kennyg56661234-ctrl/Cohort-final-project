// server.js
const express = require('express');
const app = express();
const stripe = require('stripe')('YOUR_STRIPE_SECRET_KEY');

app.use(express.json());

app.post('/create-checkout-session', async (req, res) => {
  const items = req.body.items;

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: items,
    mode: 'payment',
    success_url: 'http://localhost:3000/success.html',
    cancel_url: 'http://localhost:3000/index.html',
  });

  res.json({ id: session.id });
});

app.listen(3000, () => console.log('Server running on port 3000'));