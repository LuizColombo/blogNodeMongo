const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
require('../models/Categoria'); 
const Categoria = mongoose.model('categorias');

require('../models/Postagem'); 
const Postagem = mongoose.model('postagens');

const { isAdmin } = require('../helpers/isAdmin');

require('../models/Usuarios');
const Usuario = mongoose.model('usuarios');

const bcrypt = require('bcryptjs');
const passport = require('passport');

//Rotas

//-------------------------------------------------------------------------------------------------//
router.get('/', isAdmin, (req, res) => {
    res.render('./admin/admin');
});

//-------------------------------------------------------------------------------------------------//
router.get('/categorias', isAdmin, (req, res) => {
    Categoria.find().sort({date: 'desc'}).lean().then((categorias) => {
        res.render('./admin/categorias', { categorias: categorias })
        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro ao listar as categorias')
            res.redirect('/admin');
        });
});

//-------------------------------------------------------------------------------------------------//
router.get('/categorias/add', isAdmin, (req, res) => {
    res.render('./admin/categoriasadd');
});

//-------------------------------------------------------------------------------------------------//
router.post('/categorias/nova', isAdmin, (req, res) => {

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
router.get('/categorias/edit/:id', isAdmin, (req, res) => {
    Categoria.findOne({_id: req.params.id}).lean().then((categoria) => {
        res.render('./admin/categoriasedit', {categoria: categoria});
    }).catch((err) => {
        req.flash('error_msg', 'Esta categoria não existe');
        res.redirect('/admin/categorias');
    });
});

//-------------------------------------------------------------------------------------------------//
router.post('/categorias/edit', isAdmin, (req, res) => {
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
router.post('/categorias/deletar', isAdmin, (req, res) => {
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

router.get('/postagens', isAdmin, (req, res) => {
    Postagem.find().populate('categoria').sort({date: 'desc'}).lean().then((postagens) => {
        res.render('./admin/postagens', {postagens: postagens});
    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro ao listar as postagens');
        res.redirect('/admin');
    });
});

//-------------------------------------------------------------------------------------------------//
router.get('/postagens/add', isAdmin, (req, res) => {
    Categoria.find().sort({nome: 'asc'}).lean().then((categorias) => {
        res.render('./admin/postagensadd', {categorias: categorias});
    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro ao carregar as categorias');
        res.redirect('/admin/postagens');
    });
});

//-------------------------------------------------------------------------------------------------//
router.post('/postagens/nova', isAdmin, (req, res) => {

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
router.post('/postagens/deletar', isAdmin, (req, res) => {
    Postagem.deleteOne({_id: req.body.id}).then(() => {
        req.flash('success_msg', 'Postagens deletada com sucesso!');
        res.redirect('/admin/postagens');
    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro ao deletar a Postagens');
        res.redirect('/admin/postagens');
    });
});

//-------------------------------------------------------------------------------------------------//
router.get('/postagens/edit/:id', isAdmin, (req, res) => {
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
router.post('/categorias/edit', isAdmin, (req, res) => {
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
router.post('/postagens/edit', isAdmin, (req, res) => {
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
router.get('/usuarios', isAdmin, (req, res) => {
    Usuario.find().sort({nome: 'desc'}).lean().then((usuarios) => {
        res.render('./admin/usuarios', { usuarios: usuarios })
        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro ao listar os usuários')
            res.redirect('/admin');
        });
});
//-------------------------------------------------------------------------------------------------//
router.get('/usuarios/editar/:id', isAdmin, (req, res) => {
    Usuario.findOne({_id: req.params.id}).lean().then((usuario) => {
        res.render('./admin/usuariosedit', {usuario: usuario});
    }).catch((err) => {
        req.flash('error_msg', 'Este usuário não existe');
        res.redirect('/admin/usuarios');
    });
});
//-------------------------------------------------------------------------------------------------//
router.post('/usuarios/editar', isAdmin, (req, res) => {
    Usuario.findOne({_id: req.body.id}).then((usuario) => {
        usuario.nome = req.body.nome;
        usuario.email = req.body.email;
        usuario.roleAdmin = req.body.roleAdmin ? 1 : 0;

        return usuario.save();
    }).then(() => {
        req.flash('success_msg', 'Usuário editado com sucesso!');
        res.redirect('/admin/usuarios');
    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro ao editar o usuário: ' + err);
        res.redirect('/admin/usuarios');
    });
});
//-------------------------------------------------------------------------------------------------//
router.post('/usuarios/deletar/:id', isAdmin, (req, res) => {
    Usuario.deleteOne({_id: req.params.id}).then(() => {
        req.flash('success_msg', 'Usuário deletado com sucesso!');
        res.redirect('/admin/usuarios');
    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro ao deletar o usuário');
        res.redirect('/admin/usuarios');
    });
});
//-------------------------------------------------------------------------------------------------//
router.get('/usuarios/add', isAdmin, (req, res) => {
    res.render('./admin/usuariosadd');
});

//-------------------------------------------------------------------------------------------------//
router.post('/usuarios/add', (req, res) => {
    var erros = [];

    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        erros.push({texto: "Nome inválido"});
    }
    if(!req.body.email || typeof req.body.email == undefined || req.body.email == null){
        erros.push({texto: "E-mail inválido"});
    }
    if(!req.body.senha || typeof req.body.senha == undefined || req.body.senha == null){
        erros.push({texto: "Senha inválida"});
    }
    if(req.body.senha.length < 4){
        erros.push({texto: "Senha muito curta"});
    }
    if(req.body.senha != req.body.senha2){
        erros.push({texto: "As senhas são diferentes, tente novamente"});
    }

    if(erros.length > 0){
        res.render('usuarios/registro', {erros: erros});
    } else {
        Usuario.findOne({email: req.body.email}).then((usuario) => {
            if(usuario){
                req.flash('error_msg', 'Já existe uma conta com esse e-mail no nosso sistema');
                res.redirect('/usuarios/registro');
            } else {
                const novoUsuario = new Usuario({
                    nome: req.body.nome,
                    email: req.body.email,
                    senha: req.body.senha,
                    roleAdmin: req.body.roleAdmin ? 1 : 0
                });

                bcrypt.genSalt(10, (erro, salt) => {
                    bcrypt.hash(novoUsuario.senha, salt, (erro, hash) => {
                        if(erro){
                            req.flash('error_msg', 'Houve um erro durante o salvamento do usuário');
                            return res.redirect('/');
                        }

                        // Substitui a senha pelo hash
                        novoUsuario.senha = hash;

                        // Agora sim salva no banco
                        novoUsuario.save().then(() => {
                            req.flash('success_msg', 'Usuário criado com sucesso!');
                            res.redirect('/');
                        }).catch((err) => {
                            req.flash('error_msg', 'Houve um erro ao criar o usuário, tente novamente!');
                            res.redirect('/usuarios/registro');
                        });
                    });
                });
            }
        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro interno!' + err);
            res.redirect('/');
        });
    }
});
//-------------------------------------------------------------------------------------------------//

module.exports = router;

//-------------------------------------------------------------------------------------------------//