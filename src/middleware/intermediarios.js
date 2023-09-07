const bancodedados = require('../bancodedados');
const { contas } = bancodedados

const senhaCubos = async (req, res, next) => {
    const { senha_banco } = req.query;

    if (!senha_banco) {
        return await res.status(401).json({ mensagem: "Senha não informada." })
    }
    if (senha_banco != "Cubos123bank") {
        return await res.status(403).json({ mensagem: "A senha do banco informada é inválida!" })
    }
    next();
}

const validarConta = async (req, res, next) => {
    const { numero_conta } = req.query;
    const contaEncontrada = contas.find((conta) => {
        return Number(numero_conta) === Number(conta.numero);
    })
    if (numero_conta <= 0) {
        return await res.status(404).json({ mensagem: "Por favo digite o numero da conta." });
    }
    if (!contaEncontrada) {
        return await res.status(404).json({ mensagem: "Conta bancária não encontada!" });
    }

    next()
}

const validarSenhaQuery = async (req, res, next) => {
    const { numero_conta, senha } = req.query;
    const contaEncontrada = contas.find((conta) => {
        return Number(numero_conta) === Number(conta.numero);
    })
    if (!contaEncontrada) {
        return await res.status(404).json({ mensagem: "Conta bancária não encontada!" });
    }
    if (!senha) {
        return await res.status(404).json({ mensagem: "Por favo digite a senha." });
    }
    if (senha != contaEncontrada.usuario.senha) {
        return await res.status(401).json({ mensagem: "O número da senha ou da conta está incorreto!" });
    }
    if (senha === contaEncontrada.usuario.senha) {
        return await next()
    }
}

const validarSenhaBody = async (req, res, next) => {
    const { senha, numero_conta_origem, numero_conta_destino, valor } = req.body;

    if (!numero_conta_destino || !numero_conta_origem || !valor) {
        return await res.status(400).json({ mensagem: "Todos os dados devem ser preenchidos!" });
    }
    const contaDeOrigem = contas.find((conta) => {
        return Number(numero_conta_origem) === Number(conta.numero);
    })
    const contaDeDestino = contas.find((conta) => {
        return Number(conta.numero) === Number(numero_conta_destino);
    })
    if (!contaDeOrigem) {
        return await res.status(404).json({ mensagem: "A origem da conta não foi encontrada." });
    }
    if (!contaDeDestino) {
        return await res.status(404).json({ mensagem: "O destinatário da transferência não foi econtrado." });
    }
    if (contaDeOrigem.saldo < Number(valor)) {
        return await res.status(400).json({ mensagem: "Saldo insuficiente!" });
    }
    if (!senha) {
        return await res.status(404).json({ mensagem: "Por favo digite a senha." });
    }
    if (senha != contaDeOrigem.usuario.senha) {
        return await res.status(401).json({ mensagem: "O número da senha ou da conta está incorreto!" });
    }
    if (senha === contaDeOrigem.usuario.senha) {
        return await next();
    }
}

const validarSenhaBody2 = async (req, res, next) => {
    const { senha, numero_conta, valor } = req.body;

    if (!numero_conta || !valor) {
        return await res.status(400).json({ mensagem: "Todos os dados devem ser preenchidos!" });
    }
    const contaEncontrada = contas.find((conta) => {
        return Number(numero_conta) === Number(conta.numero);
    })
    if (!contaEncontrada) {
        return await res.status(404).json({ mensagem: "O número da conta não foi encontrado." });
    }
    if (contaEncontrada.saldo < Number(valor)) {
        return await res.status(400).json({ mensagem: "O valor inserido não está disponível para saque!" });
    }
    if (!senha) {
        return await res.status(404).json({ mensagem: "Por favo digite a senha." });
    }
    if (senha != contaEncontrada.usuario.senha) {
        return await res.status(401).json({ mensagem: "O número da senha ou da conta está incorreto!" });
    }
    if (senha === contaEncontrada.usuario.senha) {
        return await next()
    }
}

module.exports = { senhaCubos, validarConta, validarSenhaQuery, validarSenhaBody, validarSenhaBody2 }