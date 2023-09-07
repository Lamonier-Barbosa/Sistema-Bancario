const router = require('express');
const controladores = require('../controller/controladores');
const { senhaCubos, validarConta, validarSenhaQuery, validarSenhaBody, validarSenhaBody2 } = require('../middleware/intermediarios');
const rotas = router();

rotas.get('/contas', senhaCubos, controladores.listarContasBancarias);
rotas.post('/contas', controladores.criarConta);
rotas.put('/contas/:numeroConta/usuario', controladores.atualizarCadastro);
rotas.delete('/contas/:numeroConta', controladores.excluirCadastro);
rotas.post('/transacoes/depositar', controladores.depositar);
rotas.get('/contas/saldo', validarConta, validarSenhaQuery, controladores.consultarSaldo);
rotas.post('/transacoes/sacar', validarSenhaBody2, controladores.sacar);
rotas.post('/transacoes/transferir', validarSenhaBody, controladores.transferir);
rotas.get('/contas/extrato', validarSenhaQuery, controladores.extrato)

module.exports = rotas;