// Helpers para Handlebars
module.exports = {
    // Verifica se dois valores são iguais
    eq: (a, b) => a == b,

    // Verifica se o usuário é admin
    isAdmin: (user, options) => {
        if(user && user.roleAdmin == 1){
            return options.fn(this); // renderiza o bloco dentro do {{#isAdmin}}
        } else {
            return options.inverse(this); // renderiza o {{else}}
        }
    }
};
