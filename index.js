const Sequelize = require ('sequelize');   // requerer o sequelize 

const conexao = new Sequelize('nodejs', 'root', 'root', { // banco, usuario, senha
    host: 'localhost',     // url
    dialect: 'mysql'       // tipod de banco para usar 
});

// Logar MySql - squemas - nodejs
// criar tabela no MySql (sozinho)
// npm install express sequelize (no terminal)
// node index.js
// select * from usuarios; (no MySQL)

conexao.authenticate()        // testar a conexão
    .then(() => {        // promessa, obtendo uma resposta 
        console.log('Conectado com sucesso');
    }).catch((erro) => {
        console.log('Deu erro ', erro)
    });

const Cargo = conexao.define('cargos', {      //defina para mim uma tabela chamada cargos
    codigo: {          //apos os {} é o objeto de configuração da coluna [coluna codigo]
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    descricao: {
        type: Sequelize.STRING(150),
        allowNull: false
    }
}, {timestamps: false});  

Cargo.sync({     // sincronizar com o banco 
    // force: true  //  ele faz um "drop table" e depois um "create table"
    alter: true     // vai alterar nossas tabelas "alter table", mas nao exclui os dados
}); 

const Usuario = conexao.define('usuarios', {
    codigo: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    nome: {
        type: Sequelize.STRING(150),
        allowNull: false
    },
    idade: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    cpf: {
        type: Sequelize.STRING(11),
        allowNull: false
    },
    codigoCargo: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {   // Chave estrangeira
            model: Cargo,  // Referência à tabela Cargo
            key: 'codigo'  // Chave primária da tabela Cargo
        //  deferrable: Sequelize.Deferrable.INITIALLY_DEFERRED
        },
        onDelete: 'CASCADE'
    }
}, {timestamps: false});

// Usuario.belongsTo(Cargo);
// Cargo.hasMany(Usuario);

Usuario.sync({
    alter: true
});

// ************************************************************************
// ************************************************************************
// ************************************************************************

const espresso = require('express');
const meuServidor = espresso();
meuServidor.use(espresso.json());

const listaCargos = [];
const listaUsuarios = [];

// ************************************************************************
// ************************************************************************
// ************************************************************************

// ************************ USUARIOS ************************

// GET USUARIOS - Rota para consultar um ou mais usuarios
meuServidor.get('/usuarios', async (requisicao, resposta) => {
    const usuarios = await Usuario.findAll();
    resposta.send(usuarios);
});
// no Thunder: http://localhost:4300/usuarios

// POST USUARIOS - Rota para criar um usuario
meuServidor.post('/usuarios', async (requisicao, resposta) => {
    const nome = requisicao.body.nome;
    const idade = requisicao.body.idade;
    const cpf = requisicao.body.cpf;
    const codigoCargo = requisicao.body.codigoCargo;

    Usuario.create({ nome: nome, idade: idade, cpf: cpf, codigoCargo: codigoCargo }).then(() => {
        resposta.send('Cadastrado com sucesso');
    }). catch((erro) => {
        resposta.send('Ocorreu um erro: ' + erro);
    })
});
// no Thunder: http://localhost:4300/usuarios
// {
//  "nome": "Nickolas",
//  "idade": 25,
//  "cpf": 10139768947,
//  "codigoCargo": 1
// }


// PUT USUARIOS - Rota para atualizar um usuario
meuServidor.put('/usuarios/:usuarioId', (requisicao, resposta) => { //rota
    const codigoUsuario = requisicao.params.usuarioId;  //encontro o id, parametro 
    const nome = requisicao.body.nome;
    const idade = requisicao.body.idade;
    const cpf = requisicao.body.cpf;
    const codigoCargo = requisicao.body.codigoCargo;

    Cargo.findOne({where: {nome: nome, idade: idade, cpf: cpf, codigoCargo: codigoCargo}}).then(cargo => { // encontrar o id (validar se existe ou nao)
        if (!cargo) {    //Validação
            resposta.status(500).send('ID não encontrado');  //informa que nao existe 
        } else {
            Cargo.update ({ nome: nome, idade: idade, cpf: cpf, codigoCargo: codigoCargo}).then(() => { // se existe, ele faz o update  {descricao: descricao (passado no thunder)}
                resposta.send('Update feito com sucesso');
            }). catch ((erro) => {
                resposta.send('Ocorreu um erro: ' + erro);
            })
        }
    }). catch((erro) => {
        resposta.send('Ocorreu um erro: ' + erro);
    })
});

// DELETE USUARIOS - Rota para remover um usuario
meuServidor.delete('/usuarios/:usuarioId', (requisicao, resposta) => { //rota
    const codigoUsuario = requisicao.params.usuarioId;  //encontro o id, parametro 

    Usuario.findOne({where: {codigo:codigoUsuario}}).then(usuario => { // encontrar o id (validar se existe ou nao)
        if (!usuario) {    //Validação
            resposta.status(404).send('ID não encontrado');  //informa que nao existe 
        } else {
            usuario.destroy().then(() => { // nao tem parametro no body do thunder 
                resposta.send('Delete feito com sucesso');
            }). catch ((erro) => {
                resposta.status(500).send('Ocorreu um erro: ' + erro);
            });
        }
    }). catch((erro) => {
        resposta.send('Ocorreu um erro: ' + erro);
    });
});
// no Thunder: http://localhost:4300/usuario/1

// ************************************************************************
// ************************************************************************
// ************************************************************************

// ************************ CARGOS ************************

// GET CARGOS - Rota para consultar um ou mais cargos
meuServidor.get('/cargos', async (requisicao, resposta) => {
    const cargos = await Cargo.findAll();
    resposta.send(cargos);
});
// no Thunder: http://localhost:4300/cargos

// POST CARGOS - Rota para criar um cargo
meuServidor.post('/cargos', async (requisicao, resposta) => {
    const descricao = requisicao.body.descricao;
    Cargo.create({ descricao: descricao }).then(() => {
        resposta.send('Cadastrado com sucesso');
    }). catch((erro) => {
        resposta.send('Ocorreu um erro: ' + erro);
    })
});
// no Thunder: http://localhost:4300/cargos
// {
//  "descricao": "Teste 1"
// }


// PUT CARGOS - Rota para atualizar um cargo
meuServidor.put('/cargos/:cargoId', (requisicao, resposta) => { //rota
    const codigoCargo = requisicao.params.cargoId;  //encontro o id, parametro 
    const descricao = requisicao.body.descricao;    // o que vou atualizar

    Cargo.findOne({where: {codigo:codigoCargo}}).then(cargo => { // encontrar o id (validar se existe ou nao)
        if (!cargo) {    //Validação
            resposta.status(500).send('ID não encontrado');  //informa que nao existe 
        } else {
            cargo.update ({ descricao: descricao}).then(() => { // se existe, ele faz o update  {descricao: descricao (passado no thunder)}
                resposta.send('Update feito com sucesso');
            }). catch ((erro) => {
                resposta.send('Ocorreu um erro: ' + erro);
            })
        }
    }). catch((erro) => {
        resposta.send('Ocorreu um erro: ' + erro);
    })
});

// DELETE CARGOS - Rota para remover um cargo
meuServidor.delete('/cargos/:cargoId', (requisicao, resposta) => { //rota
    const codigoCargo = requisicao.params.cargoId;  //encontro o id, parametro 

    Cargo.findOne({where: {codigo:codigoCargo}}).then(cargo => { // encontrar o id (validar se existe ou nao)
        if (!cargo) {    //Validação
            resposta.status(404).send('ID não encontrado');  //informa que nao existe 
        } else {
            cargo.destroy().then(() => { // nao tem parametro no body do thunder 
                resposta.send('Delete feito com sucesso');
            }). catch ((erro) => {
                resposta.status(500).send('Ocorreu um erro: ' + erro);
            });
        }
    }). catch((erro) => {
        resposta.send('Ocorreu um erro: ' + erro);
    });
});
// no Thunder: http://localhost:4300/cargos/1

// ************************************************************************
// ************************************************************************
// ************************************************************************

meuServidor.listen(4300, () => {
    console.log('Meu primeiro servidor na porta 4300.');
});
