const express = require("express"),
      mongoose = require("mongoose"),
      bodyParser = require("body-parser"),
      Encoder = require("node-html-encoder").Encoder,
      cors = require("cors");

var app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(cors({
    origin: ['http://'+process.env.ALLOWEDHOST, 'https://'+process.env.ALLOWEDHOST],
    methods: 'GET'
}));

mongoose.connect(process.env.DATABASE);
var FAQ = require("./faq");

var encoder = new Encoder('entity');

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

app.get('/api/all', function(req, res) {
    FAQ.find({}, function(err, data) {
        if (err) return res.err();
        res.json(data);
    });
});

app.post('/api/new', function(req, res) {
    var newFaq = new FAQ();
    newFaq.question = encoder.htmlEncode(req.body.question);
    newFaq.answer = encoder.htmlEncode(req.body.answer).replace(/&#10;/g, '<br/>');
    newFaq.save(function(err) {
        if (err) return res.send('error');
        res.send('success');
    });
});


app.listen(process.env.PORT);