const express = require("express"),
      mongoose = require("mongoose"),
      bodyParser = require("body-parser"),
      Encoder = require("node-html-encoder").Encoder,
      cors = require("cors"),
      auth = require("http-auth"),
      basic = auth.basic({
          realm: "Stacck FAQ",
      }, function(username, password, callback) {
          callback(username === process.env.USER && password === process.env.PASSWORD);
      });

var app = express();
app.set('view engine', 'ejs');
app.use(express.static('./views/public'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(cors({
    origin: process.env.ALLOWEDHOST.split(','),
    methods: 'GET'
}));
// app.use(auth.connect(basic));

mongoose.connect(process.env.DATABASE);
var FAQ = require("./app/models/faq");

var encoder = new Encoder('entity');

app.get('/', auth.connect(basic), function(req, res) {
    FAQ.find({}, function(err , docs) {
        if (err) return res.redirect('/');
        res.render('index.ejs', {faq: docs});
    });
});

app.get('/api', function(req, res) {
    FAQ.find({}, function(err, data) {
        if (err) return res.err();
        res.json(data);
    });
});

app.post('/api', auth.connect(basic), function(req, res) {
    var newFaq = new FAQ();
    newFaq.question = encoder.htmlEncode(req.body.question);
    newFaq.answer = encoder.htmlEncode(req.body.answer).replace(/&#10;/g, '<br/>');
    newFaq.save(function(err) {
        if (err) return res.send('error');
        res.json(newFaq);
    });
});

app.put('/api', auth.connect(basic), function(req, res) {
    FAQ.findOne({_id: req.body.id}, function(err, doc){
        if (err) return res.send('error');
        if (!doc) return res.send('error');
        doc.question = encoder.htmlEncode(req.body.question);
        doc.answer = encoder.htmlEncode(req.body.answer).replace(/&#10;/g, '<br/>');
        doc.save(function(err) {
            if (err) return res.send('error');
            res.send('success');
        });
    });
});

app.delete('/api', auth.connect(basic), function(req, res) {
    FAQ.findOneAndRemove({_id: req.body.id}, function(err) {
        if (err) return res.send('error');
        res.send('success');
    });
});

app.listen(process.env.PORT);