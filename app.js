//Módulos
const express = require('express');
const { engine } = require("express-handlebars");
const bodyParser = require('body-parser');
const app = express();
const port = process.env.port || 8081;
const admin = require("./routes/admin");
const usuarios = require("./routes/usuario");
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const flash = require('connect-flash');

require('./models/Postagem'); 
const Postagem = mongoose.model('postagens');
require('./models/Categoria');
const Categoria = mongoose.model('categorias');

const passport = require('passport');
require('./config/auth')(passport);

//-------------------------------------------------------------------------------------------------//
//configurações

//Session
app.use(session({
    secret: "cursodenode",
    resave: true,
    saveUninitialized: true
}));

//Passport
app.use(passport.initialize());
app.use(passport.session());

//Flash
app.use(flash());

//-------------------------------------------------------------------------------------------------//
//Middleware
app.use((req, res, next) => {
    res.locals.success_msg = req.flash("success_msg");
    res.locals.error_msg = req.flash("error_msg");
    res.locals.error = req.flash("error");
    res.locals.user = req.user || null;
    next();
});

//-------------------------------------------------------------------------------------------------//
//bodyParser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//-------------------------------------------------------------------------------------------------//
//Handlebars
const hbsHelpers = require('./helpers/handlebars');
app.engine("handlebars", engine({
    defaultLayout: "main",
    layoutsDir: path.join(__dirname, "views", "layouts"), // pasta do main.handlebars
    partialsDir: path.join(__dirname, "views", "partials"), // pasta das partials
    helpers: hbsHelpers
}));
app.set("view engine", "handlebars");
app.set("views", "./views"); 

//-------------------------------------------------------------------------------------------------//
//mongoose
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://root:root@localhost:27017/blogapp?authSource=admin', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log('Conectado ao MongoDB!');
})
.catch((err) => {
    console.log(`Erro ao se conectar ao MongoDB: ${err}`);
});

//-------------------------------------------------------------------------------------------------//
//Rotas

app.get('/', (req, res) => {
    Postagem.find().populate('categoria').sort({date: 'desc'}).lean().then((postagens) => {
        res.render('index', {postagens: postagens});
    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro ao listar as postagens');
        res.redirect('/404');
    });
});

//-------------------------------------------------------------------------------------------------//
app.get('/404', (req, res) => {
    res.send('Erro 404!');
});

//-------------------------------------------------------------------------------------------------//
app.get('/postagem/:slug', (req, res) => {
    Postagem.findOne({slug: req.params.slug}).lean().then((postagem) => {
        if(postagem){
            res.render('postagem/index', {postagem: postagem});
        } else {
            req.flash('error_msg', 'Esta postagem não existe');
            res.redirect('/');
        }
    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro interno');
        res.redirect('/');
    });
});
//-------------------------------------------------------------------------------------------------//
app.get('/categorias', (req, res) => {
    Categoria.find().lean().then((categorias) => {
        res.render('categorias/index', {categorias: categorias});
    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro ao listar as categorias');
        res.redirect('/');
    });
});
//-------------------------------------------------------------------------------------------------//

app.get('/categorias/:slug', (req, res) => {
    Categoria.findOne({slug: req.params.slug}).lean().then((categoria) => {
        if(categoria){
            Postagem.find({categoria: categoria._id}).lean().then((postagens) => {
                res.render('categorias/postagens', {postagens: postagens, categoria: categoria});
            }).catch((err) => {
                req.flash('error_msg', 'Houve um erro ao listar as postagens');
                res.redirect('/');
            });
        } else {
            req.flash('error_msg', 'Esta categoria não existe');
            res.redirect('/');
        }
    }
    ).catch((err) => {
        req.flash('error_msg', 'Houve um erro interno ao carregar a página desta categoria');
        res.redirect('/');
    });
});

//-------------------------------------------------------------------------------------------------//
app.use('/admin', admin);

//-------------------------------------------------------------------------------------------------//
app.use('/usuarios', usuarios);

//-------------------------------------------------------------------------------------------------//
//Outros
app.listen(port, () => {
    console.log(`Servidor rodando na porta http://localhost:${port}`);
});
//-------------------------------------------------------------------------------------------------//
