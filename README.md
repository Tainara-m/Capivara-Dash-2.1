# 🦫 Capivara Dash

Um jogo arcade divertido desenvolvido com **HTML, CSS, JavaScript e P5.js**, onde você controla uma capivara em busca de comida enquanto desvia de obstáculos perigosos.

## 🎮 Sobre o jogo

Em **Capivara Dash**, o objetivo é sobreviver o máximo possível coletando capim para ganhar pontos e avançar de fase.

Ao longo da partida, a dificuldade aumenta gradualmente, exigindo mais reflexos e estratégia do jogador.

### 🌿 Itens do jogo

| Item | Efeito |
|--------|--------|
| 🌿 Capim | +10 pontos |
| 🪨 Pedra | Perde 1 vida |
| ❤️ Coração | Recupera 1 vida |
| 🔑 Chave (após fase 5) | Permite reviver uma vez |

---

## ✨ Funcionalidades

- Sistema de pontuação
- Sistema de fases progressivas
- Barra de progresso da fase
- Recorde salvo localmente
- Três níveis de dificuldade
  - Fácil
  - Médio
  - Difícil
- Sistema de pausa
- Sistema de mutar áudio
- Reviver utilizando chave especial
- Efeitos visuais ao trocar de fase
- Responsividade para desktop e mobile
- Suporte para modo paisagem (landscape)
- Seleção de personagens
- Música de fundo
- Efeitos sonoros
- Tela de Game Over
- Sistema de HUD moderno

---

## 🦫 Personagens

O jogador pode escolher entre diferentes versões da capivara:

- 🦫 Clássica
- 🥷 Ninja
- 👑 Princesa
- ⚽ Jogadora de Futebol
- 🚀 Astronauta
- 🩰 Bailarina

As imagens ficam armazenadas na pasta:

```text
assets/
├── classica.png
├── ninja.png
├── princesa.png
├── futebol.png
├── astronauta.png
└── bailarina.png
```

---

## 🎯 Controles

### Desktop

| Tecla | Ação |
|---------|---------|
| ⬅️ | Mover para esquerda |
| ➡️ | Mover para direita |
| P | Pausar |
| M | Mutar áudio |

### Mobile

Utilize os botões exibidos na tela para:

- Mover para esquerda
- Mover para direita
- Pausar
- Mutar

---

## 🏆 Sistema de Fases

A cada quantidade determinada de pontos, o jogador avança de fase.

Ao subir de fase:

- A velocidade aumenta gradualmente
- A dificuldade cresce
- Novos desafios surgem
- Após a fase 5 pode aparecer a chave de reviver

---

## 🔊 Áudio

O jogo possui:

- Música ambiente
- Som ao coletar comida
- Som ao perder vida
- Som de Game Over

O jogador pode ativar ou desativar o áudio a qualquer momento.

---

## 📱 Responsividade

O projeto foi desenvolvido para funcionar em:

- Desktop
- Notebook
- Tablet
- Smartphone

Com suporte especial para:

- Orientação vertical
- Orientação horizontal (landscape)

---

## 🛠️ Tecnologias utilizadas

- HTML5
- CSS3
- JavaScript ES6+
- P5.js
- P5.Sound
- Font Awesome

---

## 📂 Estrutura do projeto

```text
Capivara-Dash/
│
├── index.html
├── script.js
├── styles.css
│
├── assets/
│   ├── classica.png
│   ├── ninja.png
│   ├── princesa.png
│   ├── futebol.png
│   ├── astronauta.png
│   ├── bailarina.png
│   ├── comida.png
│   ├── ovo.png
│   ├── coracaoCheio.png
│   ├── coracaoVazio.png
│   ├── fundo.jpeg
│   ├── fundo_noturno.png
│   ├── fundo_floresta.png
│   ├── fundo.mp3
│   ├── comida.mp3
│   ├── vida.mp3
│   └── gameover.mp3
│
└── README.md
```

---

## 🚀 Como executar

1. Clone o repositório:

```bash
git clone https://github.com/seu-usuario/capivara-dash.git
```

2. Acesse a pasta:

```bash
cd capivara-dash
```

3. Abra o arquivo:

```text
index.html
```

ou utilize uma extensão como:

- Live Server (VS Code)

---

## 💡 Melhorias futuras

- Sistema de moedas
- Loja de personagens
- Conquistas
- Ranking online
- Bosses especiais
- Novos mapas
- Novas músicas
- Sistema de missões
- Power-ups especiais

---

## 👩‍💻 Desenvolvido por

**Tainara Martins**

Projeto criado para fins de estudo, diversão e prática de desenvolvimento front-end com JavaScript e P5.js.

---

### 🌟 Se gostou do projeto

Deixe uma estrela ⭐ no repositório e compartilhe com outros apaixonados por capivaras.
