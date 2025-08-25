const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
require('../models/Categoria'); 
const Categoria = mongoose.model('categorias');

require('../models/Postagem'); 
const Postagem = mongoose.model('postagens');

//Rotas

//-------------------------------------------------------------------------------------------------//
router.get('/', (req, res) => {
    res.render('./admin/admin');
});

//-------------------------------------------------------------------------------------------------//
router.get('/categorias', (req, res) => {
    Categoria.find().sort({date: 'desc'}).lean().then((categorias) => {
        res.render('./admin/categorias', { categorias: categorias })
        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro ao listar as categorias')
            res.redirect('/admin');
        });
});

//-------------------------------------------------------------------------------------------------//
router.get('/categorias/add', (req, res) => {
    res.render('./admin/categoriasadd');
});

//-------------------------------------------------------------------------------------------------//
router.post('/categorias/nova', (req, res) => {

    let errors = [];
    if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
        errors.push({ texto: 'Nome inválido' });
    }

    if (!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null) {
        errors.push({ texto: 'Slug inválido' });
    }

    if(errors.length > 0) {
        res.render('./admin/categoriasadd', {errors: errors});
        return;
    }

    const novaCategoria = {
        nome: req.body.nome,
        slug: req.body.slug
    };

    new Categoria(novaCategoria).save()
        .then(() => {
            req.flash('success_msg', 'Categoria criada com sucesso!');
            res.redirect('/admin/categorias');
        })
        .catch((err) => {
            req.flash('error_msg', 'Houve um erro ao salvar a categoria, tente novamente!');
            res.redirect('/admin/categorias/add');
        });
});

//-------------------------------------------------------------------------------------------------//
router.get('/categorias/edit/:id', (req, res) => {
    Categoria.findOne({_id: req.params.id}).lean().then((categoria) => {
        res.render('./admin/categoriasedit', {categoria: categoria});
    }).catch((err) => {
        req.flash('error_msg', 'Esta categoria não existe');
        res.redirect('/admin/categorias');
    });
});

//-------------------------------------------------------------------------------------------------//
router.post('/categorias/edit', (req, res) => {
    Categoria.findOne({_id: req.body._id}).then((categoria) => {
        categoria.nome = req.body.nome;
        categoria.slug = req.body.slug;

        categoria.save().then(() => {
            req.flash('success_msg', 'Categoria editada com sucesso!');
            res.redirect('/admin/categorias');
        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro interno ao salvar a edição da categoria' + err);
            res.redirect('/admin/categorias');
        });

    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro ao editar a categoria' + err);
        res.redirect('/admin/categorias');
    });
});
//-------------------------------------------------------------------------------------------------//
router.post('/categorias/deletar', (req, res) => {
    Categoria.deleteOne({_id: req.body.id}).then(() => {
        req.flash('success_msg', 'Categoria deletada com sucesso!');
        res.redirect('/admin/categorias');
    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro ao deletar a categoria');
        res.redirect('/admin/categorias');
    });
});
//-------------------------------------------------------------------------------------------------//
//-------------------------------------------------------------------------------------------------//
// Rota para o painel de Postagens

router.get('/postagens', (req, res) => {
    Postagem.find().populate('categoria').sort({date: 'desc'}).lean().then((postagens) => {
        res.render('./admin/postagens', {postagens: postagens});
    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro ao listar as postagens');
        res.redirect('/admin');
    });
});

//-------------------------------------------------------------------------------------------------//
router.get('/postagens/add', (req, res) => {
    Categoria.find().sort({nome: 'asc'}).lean().then((categorias) => {
        res.render('./admin/postagensadd', {categorias: categorias});
    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro ao carregar as categorias');
        res.redirect('/admin/postagens');
    });
});

//-------------------------------------------------------------------------------------------------//
router.post('/postagens/nova', (req, res) => {

    let errors = [];
    if (!req.body.titulo || typeof req.body.titulo == undefined || req.body.titulo == null) {
        errors.push({ texto: 'Título inválido' });
    }

    if (!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null) {
        errors.push({ texto: 'Slug inválido' });
    }

    if (req.body.categoria == '0') {
        errors.push({ texto: 'Categoria inválida, registre uma categoria' });
    }

    if(errors.length > 0) {
        res.render('./admin/postagensadd', {errors: errors});
        return;
    }

    const novaPostagem = {
        titulo: req.body.titulo,
        slug: req.body.slug,
        descricao: req.body.descricao,
        conteudo: req.body.conteudo,
        categoria: req.body.categoria
    };

    new Postagem(novaPostagem).save()
        .then(() => {
            req.flash('success_msg', 'Postagem criada com sucesso!');
            res.redirect('/admin/postagens');
        })
        .catch((err) => {
            req.flash('error_msg', 'Houve um erro ao salvar a postagem, tente novamente!');
            res.redirect('/admin/postagens/add');
        });
});

//-------------------------------------------------------------------------------------------------//
router.post('/postagens/deletar', (req, res) => {
    Postagem.deleteOne({_id: req.body.id}).then(() => {
        req.flash('success_msg', 'Postagens deletada com sucesso!');
        res.redirect('/admin/postagens');
    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro ao deletar a Postagens');
        res.redirect('/admin/postagens');
    });
});

//-------------------------------------------------------------------------------------------------//
router.get('/postagens/edit/:id', (req, res) => {
    Postagem.findOne({_id: req.params.id}).lean().then((postagem) => {
        Categoria.find().sort({nome: 'asc'}).lean().then((categorias) => {
            res.render('./admin/postagemsedit', {categorias: categorias, postagem: postagem});
        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro ao listar as categorias');
            res.redirect('/admin/postagens');
        });
    }).catch((err) => {
        req.flash('error_msg', 'Esta postagem não existe');
        res.redirect('/admin/postagens');
    });
});

//-------------------------------------------------------------------------------------------------//
router.post('/categorias/edit', (req, res) => {
    Postagem.findOne({_id: req.body._id}).then((postagem) => {
        postagem.titulo = req.body.titulo;
        postagem.slug = req.body.slug;
        postagem.descricao = req.body.descricao;
        postagem.conteudo = req.body.conteudo;
        postagem.categoria = req.body.categoria;

        categoria.save().then(() => {
            req.flash('success_msg', 'Postagem editada com sucesso!');
            res.redirect('/admin/postagens');
        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro interno ao salvar a edição da postagem' + err);
            res.redirect('/admin/postagens');
        });

    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro ao editar a postagem' + err);
        res.redirect('/admin/postagens');
    });
});
//-------------------------------------------------------------------------------------------------//
router.post('/postagens/edit', (req, res) => {
    Postagem.findOne({_id: req.body.id}).then((postagem) => {
        postagem.titulo = req.body.titulo;
        postagem.slug = req.body.slug;
        postagem.descricao = req.body.descricao;
        postagem.conteudo = req.body.conteudo;
        postagem.categoria = req.body.categoria;
        return postagem.save();
    }).then(() => {
        req.flash('success_msg', 'Postagem editada com sucesso!');
        res.redirect('/admin/postagens');
    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro ao editar a postagem: ' + err);
        res.redirect('/admin/postagens');
    });
});
//-------------------------------------------------------------------------------------------------//
module.exports = router;

//-------------------------------------------------------------------------------------------------//