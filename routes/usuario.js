const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
require('../models/Usuarios');
const Usuario = mongoose.model('usuarios');
const bcrypt = require('bcryptjs');
const passport = require('passport');

//-------------------------------------------------------------------------------------------------//
//Rotas

router.get('/registro', (req, res) => {
    res.render('./usuarios/registro');
});

//-------------------------------------------------------------------------------------------------//
router.post('/registro', (req, res) => {
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
                    senha: req.body.senha
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

router.get('/login', (req, res) => {
    res.render('usuarios/login');
});
//-------------------------------------------------------------------------------------------------//
router.post('/login', (req, res, next) => {
    
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/usuarios/login',
        failureFlash: true
    })(req, res, next);
});
//-------------------------------------------------------------------------------------------------//

router.get('/logout', (req, res) => {
    req.logout((err) => {
        if(err){
            return next(err);
        }
        req.flash('success_msg', 'Deslogado com sucesso!');
        res.redirect('/');
    });
});
//-------------------------------------------------------------------------------------------------//
router.get('/redefinirSenha', (req, res) => {
    res.render('usuarios/redefinirSenha');
});

//-------------------------------------------------------------------------------------------------//
router.post('/redefinirSenha', async (req, res) => {
    const { senhaAtual, novaSenha, confirmarSenha } = req.body;
    const usuario = await Usuario.findById(req.user._id); // usuário logado via passport

    let erros = [];

    // validações básicas
    if (!usuario) {
        req.flash('error_msg', 'Você precisa estar logado para redefinir sua senha.');
        return res.redirect('/usuarios/login');
    }

    if (!senhaAtual || !novaSenha || !confirmarSenha) {
        erros.push({ texto: 'Preencha todos os campos.' });
    }

    if (novaSenha !== confirmarSenha) {
        erros.push({ texto: 'A nova senha e a confirmação não conferem.' });
    }

    if (novaSenha.length < 6) {
        erros.push({ texto: 'A senha deve ter pelo menos 6 caracteres.' });
    }

    if (erros.length > 0) {
        return res.render('usuarios/redefinirSenha', { 
            error_msg: erros.map(e => e.texto).join(' | ') 
        });
    }

    try {
        // verifica senha atual
        const senhaConfere = await bcrypt.compare(senhaAtual, usuario.senha);
        if (!senhaConfere) {
            req.flash('error_msg', 'Senha atual incorreta.');
            return res.redirect('/usuarios/redefinirSenha');
        }

        // gera hash da nova senha
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(novaSenha, salt);

        // atualiza usuário
        usuario.senha = hash;
        await usuario.save();

        req.flash('success_msg', 'Senha alterada com sucesso!');
        res.redirect('/');
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Erro ao redefinir senha. Tente novamente.');
        res.redirect('/usuarios/redefinirSenha');
    }
});

//-------------------------------------------------------------------------------------------------//

module.exports = router;

//-------------------------------------------------------------------------------------------------//