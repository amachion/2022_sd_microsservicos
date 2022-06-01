const express = require ('express');
const bodyParser = require ('body-parser');
const { v4: uuidv4 } = require ('uuid');
const axios = require ('axios');
const app = express();
app.use(bodyParser.json());

const observacoesPorLembreteId = {};

const funcoes = {
    ObservacaoClassificada: (observacao) => {
        const observacoes = observacoesPorLembreteId[observacao.lembreteId];
        const obsParaAtualizar = observacoes.find(o => o.id === observacao.id);
        obsParaAtualizar.status = observacao.status;

        axios.post("http://localhost:10000/eventos", {
            tipo: "ObservacaoAtualizada",
            dados: {
                id: observacao.id,
                texto: observacao.texto,
                lembreteId: observacao.lembreteId,
                status: observacao.status
            }
        });
    }
}




app.put('/lembretes/:id/observacoes', async (req, res) => {
    const idObs = uuidv4();
    const { texto } = req.body;
    const observacoesDoLembrete = 
    observacoesPorLembreteId[req.params.id] || [];
    //req.params nos dá acesso à lista de parâmetros da URL da requisição 
    observacoesDoLembrete.push({id: idObs, texto, status: 'aguardando'});
    observacoesPorLembreteId[req.params.id] = observacoesDoLembrete;
    await axios.post('http://localhost:10000/eventos', {
        tipo: "ObservacaoCriada",
        dados: {
            id: idObs, texto, lembreteId: req.params.id, status: 'aguardando'
        }
    })
    res.status(201).send(observacoesDoLembrete);
});
//:id é um placeholder
//exemplo: lembretes/1/observacoes

app.get('/lembretes/:id/observacoes', (req, res) => {
    res.send(observacoesPorLembreteId[req.params.id] || []);
});

app.post ("/eventos", (req, res) => {
    funcoes[req.body.tipo](req.body.dados);
    res.status(200).send({msg: "ok"});
});

app.listen(5000, () => {
    console.log ('Observacoes on. Porta 5000');
});