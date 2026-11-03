# Resgate na Serra · Sala de Crise Quântica

Jogo de crise tática que roda direto no navegador, feito para a Atividade 3 do curso *Princípios de Tecnologias Quânticas* (Ecossistema CÓRTEX · UVPR / UEPG / CTEx).

**Jogar:** https://irlansouza93.github.io/simulador-virtual-crises-taticas/

Equipes de 1 a 4 jogadores, numa tela compartilhada (por exemplo, no Google Meet), têm 45 minutos para resgatar feridos num abrigo sob a serra. O GPS está bloqueado e o inimigo escuta tudo. Em cada missão, o jogador responsável escolhe uma tecnologia e vê a decisão acontecer no mapa 3D.

| Missão | Função | Problema | O que acontece no mapa |
|---|---|---|---|
| 1. Abrigo oculto | Reconhecimento | Abrigo sob 40 m de rocha, sem poder emitir sinal | Radar triangulado e atingido pela artilharia; drone térmico abatido; gravímetro revela o abrigo em corte |
| 2. Vale sem GPS | Navegação | Torre inimiga bloqueia o satélite | Deriva da navegação inercial clássica; spoofing do GPS; inercial quântico atravessa o vale |
| 3. Rota contra o relógio | Logística | Deslizamentos e patrulhas sorteados a cada partida | Busca exaustiva contando combinações reais; rota planejada bloqueada; QAOA colapsa a superposição na melhor rota |
| 4. Mensagem inviolável | Guerra Eletrônica | Fibra grampeada, *Harvest Now, Decrypt Later* | Pacotes copiados para o cofre inimigo; espectro gravado; QKD denuncia o espião pela QBER |

## Como se joga

1. **Monte a equipe:** cada jogador escolhe um operador (8 personagens), digita o próprio nome e cria um PIN de 4 números.
2. **Decida na sua vez:** só o dono da missão assume o controle, com o próprio PIN. Uma escolha errada mostra o que deu errado, desconta minutos e fica registrada.
3. **Escreva o relatório:** ao final, cada jogador libera e assina o próprio parecer com o PIN. A conclusão da equipe é escrita em conjunto. Nada é preenchido automaticamente. Depois, é só baixar o PDF.

## Antifraude em tela compartilhada

- O PIN nunca é guardado em texto: fica só um hash PBKDF2 com sal por jogador. Não existe PIN mestre nem PIN padrão.
- PINs fracos (1111, 1234…) são recusados e cada jogador precisa de um PIN diferente.
- Três erros seguidos bloqueiam aquele jogador por 30 segundos.
- Decisões, notas de campo e pareceres entram numa cadeia de registros SHA-256. O relatório confere cada texto, autor, decisão e credencial contra essa cadeia. Se alguém editar o histórico ou o save fora do jogo (inclusive trocando o PIN de um colega), o relatório mostra "Registro alterado" e o PIN trocado é recusado.

Limite honesto: isso impede que um colega decida ou escreva no lugar do outro durante a partida. Não é segurança contra alguém com acesso às ferramentas de desenvolvedor do navegador, já que tudo roda no próprio computador, sem servidor.

## Rodar localmente

```bash
python -m http.server 8000
```

Abra http://localhost:8000. Para os testes automáticos (Node 18 ou mais recente):

```bash
npm test
```

O GitHub Actions roda os mesmos testes a cada push (`.github/workflows/ci.yml`).

## Estrutura

- `index.html`, `css/style.css`: telas e visual (carta topográfica com calco)
- `js/scene.js`: cena 3D em Three.js (relevo com curvas de nível, viaturas, aeronaves e sequências de cada decisão)
- `js/routing.js`: malha viária, sorteio de deslizamentos e patrulhas, Dijkstra e contagem de rotas
- `js/integrity.js`: PIN, bloqueio e cadeia de registros
- `js/missions.js`: conteúdo das missões
- `js/report.js`: relatório e PDF (jsPDF)
- `tests/`: testes de antifraude e da simulação

Fontes: Barlow, Barlow Condensed e Caveat Brush (Google Fonts, licença OFL). Bibliotecas: Three.js 0.160 e jsPDF 2.5.1, via CDN.
