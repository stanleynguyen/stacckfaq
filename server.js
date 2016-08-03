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
      }),
      multer = require("multer"),
      fs = require("fs");
      

var app = express();
app.set('view engine', 'ejs');
app.use(express.static('./views/public'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(cors({
    origin: process.env.ALLOWEDHOST.split(','),
    methods: 'GET'
}));
app.use(auth.connect(basic));

var upload = multer({dest: './views/public/images'});

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
    upload.single('image')(req, res, function(err) {
        if (!checkFileType(req.file.originalname, req.file.filename)) return res.send('error');
        if (err) return res.render('api.ejs', {status: 'error'});
        var newFaq = new FAQ();
        newFaq.question = encoder.htmlEncode(req.body.question);
        newFaq.answer = encoder.htmlEncode(req.body.answer).replace(/&#10;/g, '<br/>');
        if (req.file) newFaq.image = 'images/' + req.file.filename;
        newFaq.save(function(err) {
            if (err) return res.send('error');
            res.json(newFaq);
        });
    });
});

app.put('/api', auth.connect(basic), function(req, res) {
    upload.single('image')(req, res, function(err) {
        if (!checkFileType(req.file.originalname, req.file.filename)) return res.send('error');
        if (err) return res.send(err);
        FAQ.findOne({_id: req.body.id}, function(err, doc){
            if (err) return res.send('error');
            if (!doc) return res.send('error');
            doc.question = encoder.htmlEncode(req.body.question);
            doc.answer = encoder.htmlEncode(req.body.answer);
            if (req.file) doc.image = 'images/' + req.file.filename;
            doc.save(function(err) {
                if (err) return res.send('error');
                res.json(doc);
            });
        });
    });
});

app.delete('/api', auth.connect(basic), function(req, res) {
    FAQ.findOne({_id: req.body.id}, function(err, faq) {
        if (err) return res.send('error');
        if (faq.image) fs.unlink('./views/public/' + faq.image, function(err) {
            if (err) return res.send('error');
        });
        faq.remove(function(err) {
            if (err) return res.send('error');
            res.send('success');
        });
    });
});

app.delete('/api/image', auth.connect(basic), function(req, res) {
    FAQ.findOne({_id: req.body.id}, function(err, faq) {
        if (err) return res.send('error');
        if (faq.image) fs.unlink('./views/public/' + faq.image, function(err) {
            if (err) return res.send('error');
        });
        faq.image = null;
        faq.save(function(err) {
            if (err) return res.send('error');
            res.send('success');
        });
    });
});

function checkFileType(originalname, newname) {
    var test = new RegExp(/(\.jpg|\.jpeg|\.png|\.bmp|\.svg|\.gif)$/i);
    if (!test.test(originalname)) {
        fs.unlink('./views/public/images/' + newname);
        return false;
    }
    return true;
}

app.listen(process.env.PORT);