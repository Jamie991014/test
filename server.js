const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');

const vendor = require('./routes/vendor');
const snack = require('./routes/snack');
const customer = require('./routes/customer');
const order = require('./routes/order');

const port = process.env.PORT || 5000;

const app = express();
app.use(cors());
app.use(bodyParser.json());

/** URL for our live website: 
 *  https://lesillage.herokuapp.com
 */

//adding for texting whether the heroku is conntected 
// app.get('/', (req, res) => {
//     res.status(200)
//     res.write('<html style="text-align:center;"><h3> If you can see this message </h3></html>')
//     res.write('<html style="text-align:center;"><h3> that means you connect successfully </h3></html>')
//     res.write('<html style="text-align:center;"><h1> LE Sillage </h1></html>')
//     res.write('<html><h2> Welcome to our vendor cafe! </h2></html>')

//     res.write('<html><ul></html>')
//     res.write('<html><p font-size: 20px;> <a href="/menu">Check out our menu = )</a> </p></html>')
//     res.write('<html style="text-align:center;"><h4> Do Not click the menu, it is not work yet </h4></html>')
//     res.end('<html></ul></html>')
// })


const db = require('./dtbase/keys').mongoURL;
mongoose
    .connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("Yay! MongoDB Has Connected..."))

// add the route for three sections
app.use('/vendor', vendor);
app.use('/snack', snack);
app.use('/customer', customer);
app.use('/order', order);

// for sever static production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static("client/build"));
    app.get("*", (req, res) => {
        res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
    });
}

// url listen..
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})

module.exports = app;