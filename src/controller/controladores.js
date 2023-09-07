const bancodedados = require('../bancodedados');
const { format } = require('date-fns')
const { contas, saques, depositos, transferencias } = bancodedados
let saldoDaConta = 0;
const dataEHora = new Date()
const formatoData = "yyyy-MM-dd HH:mm:ss"
const dataFinal = format(dataEHora, formatoData, { timeZone: 'America/Sao_Paulo' })


const listarContasBancarias = async (req, res) => {
    await res.status(200).json(bancodedados.contas);
}

const criarConta = async (req, res) => {
    const { nome, cpf, data_nascimento, telefone, email, senha } = req.body
    let numeroDaConta = contas.length

    if (!nome || !cpf || !data_nascimento || !telefone || !email || !senha) {
        return await res.status(400).json({ mensagem: "Por favor, preencha todos os campos obrigatórios!" });
    }

    for (i = 0; i < contas.length; i++) {
        let conta = contas[i]
        numeroDaConta = Number(conta.numero);

        if (cpf === conta.usuario.cpf) {
            return await res.status(400).json({ menagem: "Já existe uma conta com o cpf ou e-mail informado!" })
        }
        if (email === conta.usuario.email) {
            return await res.status(400).json({ menagem: "Já existe uma conta com o cpf ou e-mail informado!" })
        }
    }
    const novoUsuario = {
        numero: numeroDaConta + 1,
        saldo: saldoDaConta,
        usuario: {
            nome: nome,
            cpf: cpf,
            data_nascimento: data_nascimento,
            telefone: telefone,
            email: email,
            senha: senha
        }
    }
    contas.push(novoUsuario)
    await res.status(201).json();
}

const atualizarCadastro = async (req, res) => {
    const { numeroConta } = req.params;
    const { nome, cpf, data_nascimento, telefone, email, senha } = req.body;

    if (!nome || !cpf || !data_nascimento || !telefone || !email || !senha) {
        return await res.status(400).json({ mensagem: "Por favor, preencha todos os campos obrigatórios!" });
    }
    const contaEncontrada = contas.find((conta) => {
        return Number(conta.numero) === Number(numeroConta)
    })

    if (!contaEncontrada) {
        return await res.status(404).json({ mensagem: "O número da conta não foi encntrado." });
    }
    for (i = 0; i < contas.length; i++) {
        let conta = contas[i]

        if (cpf === conta.usuario.cpf) {
            return await res.status(400).json({ menagem: "Já existe uma conta com o cpf ou e-mail informado!" })
        }
        if (email === conta.usuario.email) {
            return await res.status(400).json({ menagem: "Já existe uma conta com o cpf ou e-mail informado!" })
        }
    }
    const atualizarUsuario = {
        numero: contaEncontrada.numero,
        saldo: contaEncontrada.saldo,
        usuario: {
            nome: nome,
            cpf: cpf,
            data_nascimento: data_nascimento,
            telefone: telefone,
            email: email,
            senha: senha
        }
    }
    await contas.splice(numeroConta - 1, 1, atualizarUsuario);
    await res.status(204).json();
}

const excluirCadastro = async (req, res) => {
    const { numeroConta } = req.params;

    const contaEncontrada = contas.find((conta) => {
        return Number(conta.numero) === Number(numeroConta)
    })
    if (!contaEncontrada) {
        return await res.status(404).json({ mensagem: "O número da conta não foi encntrado." });
    }
    if (contaEncontrada.saldo != 0) {
        return await res.status(403).json({ mensagem: "A conta só pode ser removida se o saldo for zero!" });
    }
    await contas.splice(numeroConta - 1, 1);
    res.status(204).json();
}

const depositar = async (req, res) => {
    const { numero_conta, valor } = req.body;
    if (!numero_conta || !valor) {
        return await res.status(401).json({ mensagem: "O número da conta e o valor são obrigatórios!" });
    }
    const contaEncontrada = contas.find((conta) => {
        return Number(conta.numero) === Number(numero_conta)
    })
    if (!contaEncontrada) {
        return await res.status(404).json({ mensagem: "O número da conta não foi encontrado." });
    }
    if (Number(valor) <= 0) {
        return await res.status(400).json({ mensagem: "O Valor inserido não é valido!" });
    }
    const depositos = {
        data: dataFinal,
        numero_conta: Number(numero_conta),
        valor: Number(valor)
    }
    if (contaEncontrada && Number(valor) > 0) {
        await res.status(200).json()
        bancodedados.depositos.push(depositos)
        contaEncontrada.saldo += Number(valor);
    }
}

const sacar = async (req, res) => {
    const { numero_conta, valor } = req.body
    const contaEncontrada = contas.find((conta) => {
        return Number(conta.numero) === Number(numero_conta)
    })
    const saque = {
        data: dataFinal,
        numero_conta: Number(numero_conta),
        valor: Number(valor)
    }
    await res.status(204).json();
    contaEncontrada.saldo -= Number(valor);
    bancodedados.saques.push(saque);
}

const transferir = async (req, res) => {
    const { numero_conta_origem, numero_conta_destino, valor } = req.body;

    const contaDeOrigem = contas.find((conta) => {
        return Number(conta.numero) === Number(numero_conta_origem);
    })
    const contaDeDestino = contas.find((conta) => {
        return Number(conta.numero) === Number(numero_conta_destino);
    })
    const transferenciaEnviada = {
        data: dataFinal,
        numero_conta_origem: numero_conta_origem,
        numero_conta_destino: numero_conta_destino,
        valor: Number(valor)
    }
    await res.status(204).json();
    contaDeOrigem.saldo -= Number(valor);
    contaDeDestino.saldo += Number(valor);
    bancodedados.transferencias.push(transferenciaEnviada);
}

const consultarSaldo = async (req, res) => {
    const { numero_conta } = req.query;
    const contaEncontrada = contas.find((conta) => {
        return Number(numero_conta) === Number(conta.numero);
    })
    if (contaEncontrada) {
        return await res.status(200).json({ saldo: contaEncontrada.saldo });
    }
}

const extrato = async (req, res) => {
    const { numero_conta } = req.query;
    const depositosFeitos = depositos.filter((deposito) => {
        return Number(deposito.numero_conta) === Number(numero_conta);
    })
    const saquesFeitos = saques.filter((saque) => {
        return Number(saque.numero_conta) === Number(numero_conta);
    })
    const transferenciaEnviada = transferencias.filter((transferir) => {
        return Number(transferir.numero_conta_origem) === Number(numero_conta);
    })
    const transferenciasRecebidas = transferencias.filter((receber) => {
        return Number(receber.numero_conta_destino) === Number(numero_conta);
    })

    const extratoRequisitado = {
        depositos: depositosFeitos,
        saques: saquesFeitos,
        transferenciasEviadas: transferenciaEnviada,
        transferenciasRecebidas: transferenciasRecebidas
    }

    await res.status(200).json(extratoRequisitado);
}

module.exports = { listarContasBancarias, criarConta, atualizarCadastro, excluirCadastro, depositar, sacar, consultarSaldo, transferir, extrato };