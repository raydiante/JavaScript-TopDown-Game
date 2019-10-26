// Jogo Desenvolvido por
//           Rayssa Rosa - 180100523
//           Taua Almeida - 180100527 
//           Elder Costa - 180100528 
(function() {
   
    var stage = "";     // - Referencia para o Stage do Jogo
    var output;     // - Referencia para o Output do Jogo
    var gameMessage;    // - Mensagens do Jogo

   
    // - Código dos personagens de jogo
    const character = {
        EMPTY: -1,
        FLOOR: 0,
        WALL: 1,
        STAIRE: 2,
        STAIRS: 3,
        ICESTONE: 4,
        KEY: 5,
        STONELOCK: 6,
        DOORLOCK: 7,
        QUESTION: 8,
        BONES: 9,
        HERO: 10,
        ENEMY: 11
    }


    // - Tamanho de cada celula
    const SIZE = 32;


    // - Codigo das teclas
    const teclado = {
        LEFT: 37,
        RIGHT: 39,
        UP: 38,
        DOWN: 40,
        SPACE: 32,
        ESC: 27,
        ENTER: 13,
        LSHIFT: 16,
        RSHIFT: 16,
        LALT: 18,
        LCTRL: 17,
        KPAD_PLUS: 107,
        KPAD_MINUS: 109
    };


    // - Mapas existentes em maps.js
    var map = map1;

    // - Referência para indices, linhas e colunas do Mapa
    const INDEX = map.length;
    const ROWS = map[0].length;
    const COLUMNS = map[0][0].length;
    

    // - Sons do Jogo
    const sounds={
        TAKEKEY:undefined,
        TAKEBONES:undefined,
        QUESTION:undefined,
        BACKGROUND:undefined,
        OPENWOODDOR:undefined,
        OPENSTONEDOOR:undefined,
        MUTE: 0,
        IMMUNITY:undefined,
        DEATHZOMBIE:undefined,
        STAIRSUP:undefined,
        WINGAME:undefined,
        KILLZOMBIE:undefined,
        GAMEOVER:undefined
    }


    // - Referencia para o indice da parede
    var wallIndex = 1; 
    var stairIndex = 1;


    // - Objeto para referenciar inimigos
    var enemy = {
        index : 2,
        id : [],
        row : [],
        column : [],
        qtdEnemies : 0,
        direction : []
    }


    // - Objeto para referenciar o herói
    var hero = {
        index: 2, 
        row: undefined,
        column: undefined,
        direction: undefined,
        bones: 0,
        floor: 0,
        life: 100,
        keys: 0,
        immunity: 0,
        power: 0,
        walking: false,
        pontos: 0
    } 

    // - Tempo que setInterval chamará a função moveEnemy
    var fps = 5000/5;

    // - Variável utilizada para dizer se jogador está ou não jogando
    var isPlaying = undefined;

    // - Evento adicionado para carregar tudo antes de iniciar o jogo
    window.addEventListener("load", playgame, false);

    // Função para o botão de começar o jogo, chama a função init
    function playgame() {
        let startModal = document.getElementById("startModal");
        let botaoStart = document.getElementById("buttonStart");

        botaoStart.addEventListener("click",function(){
            startModal.style.display = "none";
            init();
        },false);
    }
    
    // Função para realizar as configurações do Jogo
    function setup(){
        audioSetup();

        isPlaying = true;
        
        stage = document.querySelector("#stage");
        output = document.querySelector("#infoPanel");
    }

    // Função que inicia o jogo
    function init() {
        setup();

        sounds.BACKGROUND.play();
        
        sendMessage();

        findGameObjects();

        setInterval(moveEnemy,fps);

        render();

        window.addEventListener("keydown",keydownHandler,false);

        let volumeButaoOff = document.getElementById("volumeOff");
        volumeButaoOff.addEventListener("click",desligarSom,false);
    }

    // Função que renderiza em tela os acontecimentos de jogo
    function render(){

        while(stage.hasChildNodes()) 
            stage.removeChild(stage.firstChild);

        let aux = 0;

        for(let ind = 0; ind < INDEX; ind++){
            for(let row = 0; row < ROWS; row++){
                for (let col = 0; col < COLUMNS; col++){

                    // - Cria o elemento cell, adiciona a classe e adiciona cell ao stage do jogo
                    let cell = document.createElement("div");
			        cell.setAttribute("class","cell");
                    stage.appendChild(cell);

                    // - Adiciona a classe referente a cada tipo de personagem
                    switch(map[ind][row][col]){
                        case character.EMPTY : cell.classList.add("empty");break;
                        case character.FLOOR : cell.classList.add("floor");break;
                        case character.WALL : cell.classList.add("wall");break;
                        case character.STAIRE : cell.classList.add("stairsE");break;
                        case character.STAIRS : cell.classList.add("stairsS");break;
                        case character.ICESTONE : cell.classList.add("iceStone");break;
                        case character.KEY : cell.classList.add("key");break;
                        case character.STONELOCK : cell.classList.add("stoneLock");break;
                        case character.DOORLOCK : cell.classList.add("doorLock");break;
                        case character.QUESTION : cell.classList.add("question");break;
                        case character.BONES : cell.classList.add("bones");break;
                        case character.HERO : cell.classList.add("actor");
                            // - Adiciona movimento ao ator caso o herói esteja a andar
                            if(hero.walking){
                                cell.classList.add("animated","walk");
                                hero.walking = false;
                            }
                            // - Adiciona o efeito de piscar caso o herói esteja imune
                            if(hero.immunity === 1){
                                cell.classList.add("animated","blink","fast");  
                            }
                            // - Altera a direção que herói está conforme o movimento passado
                            switch(hero.direction){
                                case teclado.UP : cell.classList.remove("left","down","right");break;
                                case teclado.LEFT : cell.classList.add("left"); break;
                                case teclado.RIGHT : cell.classList.add("right"); break;
                                case teclado.DOWN : cell.classList.add("down"); break;
                            }break;
                        case character.ENEMY : cell.classList.add("enemy");
                            // - Altera a direção do inimgo conforme movimento passado
                            if(hero.floor === 1){
                                cell.classList.add("colorize240");
                            }
                            switch(enemy.direction[aux]){
                                case teclado.UP : cell.classList.remove("left","down","right");break;
                                case teclado.LEFT : cell.classList.add("left"); break;
                                case teclado.RIGHT : cell.classList.add("right"); break;
                                case teclado.DOWN : cell.classList.add("down"); break;
                            }
                            aux++;
                    }

                    // - Ajusta as cells no stage
                    cell.style.zIndex = ind;
                    cell.style.left = col * SIZE + "px";
			        cell.style.top = row * SIZE + "px";
                }
            }
        }

        // - Atualizar os pontos do jogador
        calcPoints();
    }

    // Função que encontra herói e inimigos no mapa
    function findGameObjects(){
        for (let linha = 0; linha < ROWS; linha++ ){
            for (let coluna = 0; coluna < COLUMNS; coluna++){
                switch(map[hero.index][linha][coluna]){
                    case character.HERO : hero.row = linha; 
                                        hero.column = coluna; 
                                        break;
                    case character.ENEMY : enemy.row.push(linha); 
                                        enemy.column.push(coluna);
                                        enemy.id.push(enemy.qtdEnemies);
                                        enemy.direction.push(teclado.UP); 
                                        enemy.qtdEnemies++; 
                                        break;
                }
            }
        }
    }

    // Função para lidar com movimentos do teclado
    function keydownHandler(event){

        hero.walking = true;

        switch(event.keyCode){
            case teclado.UP : hero.direction=teclado.UP;
                // - Testar se acima (row-1) do herói encontra-se porta de madeira ou de pedra
                if(map[wallIndex][hero.row-1][hero.column]===character.STONELOCK || 
                    map[wallIndex][hero.row-1][hero.column]===character.DOORLOCK){
                    // - Caso tenha portas e herói conseguiu abri-las, remover do mapa
                    if(obstacleHandler(map[wallIndex][hero.row-1][hero.column]) ){
                        map[wallIndex][hero.row-1][hero.column]=character.EMPTY;
                    }
                }
                // - Só permitir herói andar pra cima caso acima dele estiver vazio, ou for uma das escadas
                if(hero.row != 0 && map[wallIndex][hero.row-1][hero.column] === character.EMPTY || 
                    map[stairIndex][hero.row-1][hero.column] === character.STAIRE || 
                    map[stairIndex][hero.row-1][hero.column] === character.STAIRS){
                    // - Esvaziar posição do héroi e diminuir a linha para ele andar para cima               
                        map[hero.index][hero.row][hero.column] = character.EMPTY;
                        hero.row--;
                }
                break;

            case teclado.DOWN : hero.direction=teclado.DOWN;
                // - Testar se abaixo (row+1) do herói encontra-se porta de madeira ou de pedra
                if(map[wallIndex][hero.row+1][hero.column]===character.STONELOCK || 
                    map[wallIndex][hero.row+1][hero.column]===character.DOORLOCK){
                    // - Caso tenha portas e herói conseguiu abri-las, remover do mapa   
                    if(obstacleHandler(map[wallIndex][hero.row+1][hero.column]) ){
                        map[wallIndex][hero.row+1][hero.column]=character.EMPTY;
                    }
                }
                // - Só permitir herói andar pra baixo caso abaixo dele estiver vazio, ou for uma das escadas
                if(hero.row < 20 && map[wallIndex][hero.row+1][hero.column] === character.EMPTY || 
                    map[stairIndex][hero.row+1][hero.column] === character.STAIRE || 
                    map[stairIndex][hero.row+1][hero.column] === character.STAIRS){
                        // - Esvaziar posição do héroi e aumentar a linha para ele andar para baixo
                        map[hero.index][hero.row][hero.column] = character.EMPTY;
                        hero.row++;
                }
                break;

            case teclado.LEFT : hero.direction=teclado.LEFT;
                // - Testar se à esquerda (column-1) do herói encontra-se porta de madeira ou de pedra
                if(map[wallIndex][hero.row][hero.column-1]===character.STONELOCK || 
                    map[wallIndex][hero.row][hero.column-1]===character.DOORLOCK){
                    // - Caso tenha portas e herói conseguiu abri-las, remover do mapa
                    if(obstacleHandler(map[wallIndex][hero.row][hero.column-1]) ){
                        map[wallIndex][hero.row][hero.column-1]=character.EMPTY;
                    }
                }
                // - Só permitir herói andar pra esquerda caso a esquerda dele estiver vazio, ou for uma das escadas
                if(hero.column != 0 && map[wallIndex][hero.row][hero.column-1] === character.EMPTY || 
                    map[stairIndex][hero.row][hero.column-1] === character.STAIRE || 
                    map[stairIndex][hero.row][hero.column-1] === character.STAIRS){
                        // - Esvaziar posição do héroi e diminuir a coluna para ele andar para baixo
                        map[hero.index][hero.row][hero.column] = character.EMPTY;
                        hero.column--;
                }
                break;

            case teclado.RIGHT : hero.direction=teclado.RIGHT;
                // - Testar se à direita (column+1) do herói encontra-se porta de madeira ou de pedra
                if(map[wallIndex][hero.row][hero.column+1]===character.STONELOCK || 
                    map[wallIndex][hero.row][hero.column+1]===character.DOORLOCK){
                    // - Caso tenha portas e herói conseguiu abri-las, remover do mapa
                    if(obstacleHandler(map[wallIndex][hero.row][hero.column+1]) ){
                        map[wallIndex][hero.row][hero.column+1]=character.EMPTY;
                    }
                }
                // - Só permitir herói andar pra direita caso a direita dele estiver vazio, ou for uma das escadas
                if(hero.column < 20 && map[wallIndex][hero.row][hero.column+1] === character.EMPTY || 
                    map[stairIndex][hero.row][hero.column+1] === character.STAIRE || 
                    map[stairIndex][hero.row][hero.column+1] === character.STAIRS){
                        // - Esvaziar posição do héroi e diminuir a coluna para ele andar para baixo
                        map[hero.index][hero.row][hero.column] = character.EMPTY;
                        hero.column++;
                }
                break;
        } 

        // - Chamar funções de acordo com o que for encontrado pelo herói

        if(map[hero.index][hero.row][hero.column] === character.KEY){
            takeItem(map[hero.index][hero.row][hero.column]);
            map[hero.index][hero.row][hero.column]=character.EMPTY;
        }

        if(map[hero.index][hero.row][hero.column] === character.ENEMY){
            if(!fightEnemy(hero.row,hero.column)){
                map[hero.index][hero.row][hero.column] = character.EMPTY;
                endGame();
            }
        } 

        if(map[hero.index][hero.row][hero.column] === character.BONES) fightBones();

        if(map[stairIndex][hero.row][hero.column] === character.STAIRE) changeFloor();

        if(map[stairIndex][hero.row][hero.column] === character.STAIRS) winGame();

        if(map[hero.index][hero.row][hero.column] === character.QUESTION) help();

        // - Colocar o herói em seu novo lugar no mapa e renderizar novamente o mapa

        map[hero.index][hero.row][hero.column] = character.HERO;
        
        render();

    }
    
    // Função que move os inimigos
    function moveEnemy(){
        // - Iniciar movimentos do inimgo quando jogador está jogando
        if(isPlaying){
            let validDirections=[teclado.UP,teclado.DOWN,teclado.LEFT,teclado.RIGHT];

            // - Limpar vetor de direções
            for(let i=0; i<enemy.qtdEnemies; i++) enemy.direction.pop();

            // - Para cada inimigo existente, fazer movimenta-los randomicamente usando as direções validas
            for(let i=0; i<enemy.qtdEnemies; i++){

                let randomNumber = Math.floor(Math.random() * validDirections.length);
                let direction = validDirections[randomNumber];

                switch (direction){
                    case teclado.UP : 
                        // - Só permitir inimigo[i] subir (row[i]-1) se acima dele estiver sem objetos e sem parede
                        if(map[wallIndex][enemy.row[i]-1][enemy.column[i]] === character.EMPTY && 
                            map[enemy.index][enemy.row[i]-1][enemy.column[i]] === character.EMPTY ){
                                // - Esvaziar local no mapa do inimigo[i] e diminuir a linha para que ele suba
                                map[enemy.index][enemy.row[i]][enemy.column[i]] = character.EMPTY;
                                enemy.row[i]--;
                        }else if(map[enemy.index][enemy.row[i]-1][enemy.column[i]] === character.HERO){
                            if (!fightEnemy(enemy.row[i]-1,enemy.column[i])){
                                map[hero.index][enemy.row[i]][enemy.column[i]]=character.EMPTY;
                                enemy.row[i]--;
                                map[enemy.index][enemy.row[i]][enemy.column[i]] = character.ENEMY;
                                endGame();
                            }
                        }
                        break;

                    case teclado.DOWN : 
                        // - Só permitir inimigo[i] descer (row[i]+1) se abaixo dele estiver sem objetos e sem parede
                        if(map[wallIndex][enemy.row[i]+1][enemy.column[i]] === character.EMPTY &&
                            map[enemy.index][enemy.row[i]+1][enemy.column[i]] === character.EMPTY ){
                                // - Esvaziar local no mapa do inimigo[i] e aumentar a linha para que ele desça
                                map[enemy.index][enemy.row[i]][enemy.column[i]] = character.EMPTY;
                                enemy.row[i]++;
                        }else if(map[enemy.index][enemy.row[i]+1][enemy.column[i]] === character.HERO){
                            if (!fightEnemy(enemy.row[i]+1,enemy.column[i])){
                                map[hero.index][enemy.row[i]][enemy.column[i]]=character.EMPTY;
                                enemy.row[i]++;
                                map[enemy.index][enemy.row[i]][enemy.column[i]] = character.ENEMY;
                                endGame();
                            }
                        }
                        break;

                    case teclado.LEFT : 
                        // - Só permitir inimigo[i] ir para esquerda (column[i]-1) ela estiver sem objetos e sem parede
                        if(map[wallIndex][enemy.row[i]][enemy.column[i]-1] === character.EMPTY && 
                            map[enemy.index][enemy.row[i]][enemy.column[i]-1] === character.EMPTY ){
                                // - Esvaziar local no mapa do inimigo[i] e diminuir a coluna para que ele vá para esquerda
                                map[enemy.index][enemy.row[i]][enemy.column[i]] = character.EMPTY;
                                enemy.column[i]--;
                        }else if(map[enemy.index][enemy.row[i]][enemy.column[i]-1] === character.HERO){
                            if (!fightEnemy(enemy.row[i],enemy.column[i]-1)){
                                map[hero.index][enemy.row[i]][enemy.column[i]]=character.EMPTY;
                                enemy.column[i]--;
                                map[enemy.index][enemy.row[i]][enemy.column[i]] = character.ENEMY;
                                endGame();
                            }
                        }
                        break;

                    case teclado.RIGHT : 
                        // - Só permitir inimigo[i] ir para direita (column[i]+1) ela estiver sem objetos e sem parede
                        if(map[wallIndex][enemy.row[i]][enemy.column[i]+1] === character.EMPTY  && 
                            map[enemy.index][enemy.row[i]][enemy.column[i]+1] === character.EMPTY ){
                                // - Esvaziar local no mapa do inimigo[i] e aumentar a coluna para que ele vá para direita
                                map[enemy.index][enemy.row[i]][enemy.column[i]] = character.EMPTY;
                                enemy.column[i]++;
                        }else if(map[enemy.index][enemy.row[i]][enemy.column[i]+1] === character.HERO){
                            if (!fightEnemy(enemy.row[i],enemy.column[i]+1)){
                                map[hero.index][enemy.row[i]][enemy.column[i]]=character.EMPTY;
                                enemy.column[i]++;
                                map[enemy.index][enemy.row[i]][enemy.column[i]] = character.ENEMY;
                                endGame();
                            }
                        }
                        break;
                }
                
                // - Colocar inimigo no novo local
                map[enemy.index][enemy.row[i]][enemy.column[i]] = character.ENEMY;

                // - Adicionar direções ao vetor de direções
                enemy.direction.push(direction);
            }
            // - Renderizar inimigos movidos
            render();
        }
    }

    // - Função que altera imunidade do herói
    function imunidade(){
        hero.immunity=0;

        sendMessage("Sua imunidade acabou!");
    }

    // - Função que lida com a luta entre herói e inimigos
    function fightEnemy(linha,coluna){

        if(hero.immunity===1){
            sendMessage("Você está invisivel, o Zumbi não pode te machucar!!");
            return true;
        }else if(hero.power===1){
            // - Encontrar qual inimigo se encontrou com herói
            for(let i=0 ; i<enemy.qtdEnemies ; i++){
                if(enemy.row[i] === linha && enemy.column[i] === coluna){
                    // - Retirar inimigo
                    enemy.row.splice(i,1);
                    enemy.column.splice(i,1);
                    enemy.id.splice(i,1);
                    enemy.qtdEnemies--;

                    // - Acionar som de killZombie
                    sounds.KILLZOMBIE.play();

                    // - Tirar poder do herói, colocar o heroi no lugar do inimigo e enviar mensagem ao output
                    hero.power=0;
                    map[hero.index][linha][coluna]=character.HERO;
                    sendMessage("Você matou um Zumbi");
                    break;
                }
            } 
            return true;
        }else{
            // - Caso o herói perca, retornar valor de falso para ser tratado no movimento
            hero.life = 0;
            sounds.DEATHZOMBIE.play();
            return false;
        }
    }

    // - Função que lida com o encontro do heroi com ossos
    function fightBones(){
        // numAleatorio == 1 ataca || numAleatorio == 0 nao faz nada
        sounds.TAKEBONES.play();

        var atacar = 1;

        numAleatorio=Math.floor(Math.random() * 2);
        
        if(numAleatorio === atacar){
            numAleatorio=Math.floor(Math.random() * 35) + 10;
            if(hero.life-numAleatorio <= 0){
                // heroi morreu
                endGame();
            }else{
                hero.life-=numAleatorio;
                sendMessage("O osso estava VIVO!!!! Você perdeu " + numAleatorio + " vidas");
            }

        }else{
            hero.bones++;
            sendMessage("Eram Apenas Ossos");
        }
    }

    // - Função que lida quando o heroi encontra o item de ajuda
    function help(){
        // Ao acionar o help pode acontecer o seguinte: Aumentar a vida em 25 (nao ultrapassa 100)
        // Dar o poder de matar o zombie
        // Dar imunidade ao jogador (pode passar por osso ou trombar em um zombie)
        sounds.QUESTION.play();

        let help = {
            LIFE: 1,
            POWER: 2,
            IMMUNITY: 3
        }

        let randomHelp = Math.floor(Math.random() * 3) + 1;

        switch(randomHelp){
            case help.LIFE : let life = 25; 
                            if(hero.life + life > 100) hero.life = 100
                            else hero.life += life;
                            sendMessage("Você ganhou 25 de life !");
                            break;
            case help.POWER : if (hero.power < 1) hero.power = 1;
                            sendMessage("Você Recebeu um Boost de Poder !");
                            break;
            case help.IMMUNITY : if (hero.immunity < 1) hero.immunity = 1;
                                sendMessage("Você está invencivel !");
                                setTimeout(imunidade,5000);
                                sounds.IMMUNITY.play();
                                break;
        }
    }

    // - Função que resolve quando se encontra o item
    function takeItem(item){
        switch(item){
            case character.KEY : hero.keys++; 
                                sendMessage("Você encontrou uma chave!");
                                sounds.TAKEKEY.play();
                                break;
        }
    }

    // Função que irá tratar quando herói encontrar uma porta ou uma icestone
    function obstacleHandler(obstacle){
        switch(obstacle){
            // Decidir se chaves do herói são suficientes para abrir as portas, enviar mensagem e colocar o som de abrir a porta
            case character.DOORLOCK : if(hero.keys >= 3){
                                        hero.keys-=3;
                                        sendMessage("Você abriu a porta de madeira !");
                                        sounds.OPENWOODDOR.play();
                                        return true;
                                    }else{
                                        sendMessage("Você não pode abrir essa porta ainda!");
                                        return false;
                                    }
            case character.STONELOCK : if(hero.keys > 0){
                                        hero.keys--;
                                        sendMessage("Você abriu a porta de pedra !");
                                        sounds.OPENSTONEDOOR.play();
                                        return true;
                                    }else{
                                        sendMessage("Você não pode abrir essa porta ainda!");
                                        return false;
                                    }
        }
    }

    // - Função para enviar mensagem ao Painel
    function sendMessage(mensagem){
        gameMessage = "Vida: " + hero.life + "   |  Keys: " + hero.keys + "  |   Bones: " + hero.bones +  
                        "   |   Power: " + hero.power + "  |   Immunity: " + hero.immunity;

        if(mensagem) gameMessage =  mensagem + "<br>" + gameMessage;

        output.innerHTML = gameMessage;
    }

    // Função para configurar os sons de jogo
    function audioSetup(){
        sounds.BACKGROUND=document.querySelector("#somDeFundo");
        sounds.BACKGROUND.volume=0.6;
        sounds.BACKGROUND.loop = true;
        sounds.TAKEKEY=document.querySelector("#takeKey");
        sounds.TAKEBONES=document.querySelector("#takeBones");
        sounds.QUESTION=document.querySelector("#question");
        sounds.OPENWOODDOR=document.querySelector("#openWoodDoor");
        sounds.OPENSTONEDOOR=document.querySelector("#openStoneDoor");
        sounds.IMMUNITY=document.querySelector("#immunity");
        sounds.DEATHZOMBIE=document.querySelector("#deathZombie");
        sounds.STAIRSUP=document.querySelector("#stairsUp");
        sounds.WINGAME=document.querySelector("#winGame");
        sounds.KILLZOMBIE=document.querySelector("#killZombie");
        sounds.GAMEOVER=document.querySelector("#gameOver");
    }

    // Funcao para desligar e ligar o som do jogo
    function desligarSom(){
        let audioElements = document.getElementsByTagName("audio");
        let butao = document.getElementById("soundControl");

        if(sounds.MUTE === 0){
            for(let i = 0; i < audioElements.length; i++){
                audioElements[i].muted = true;
                sounds.MUTE = 1;
                butao.classList.remove("fa-volume-up");
                butao.classList.add("fa-volume-mute");
            }
        }else{
            for(let i = 0; i < audioElements.length; i++){
                audioElements[i].muted = false;
                sounds.MUTE = 0;
                butao.classList.remove("fa-volume-mute");
                butao.classList.add("fa-volume-up");
            }
        }
    }

    // - Função que da refresh no game antes de mudar de mapa
    function refreshGameObjects(){
        for (let linha = 0; linha < ROWS; linha++ ){
            for (let coluna = 0; coluna < COLUMNS; coluna++){
                switch(map[hero.index][linha][coluna]){
                    case character.HERO : hero.row = undefined; 
                                        hero.column = undefined; 
                                        break;
                    case character.ENEMY : enemy.row.pop(); 
                                        enemy.column.pop();
                                        enemy.id.pop();
                                        enemy.direction.pop(); 
                                        enemy.qtdEnemies--; 
                                        break;
                }
            }
        }
    }

    // - Função responsavel por alterar o piso
    function changeFloor(){
        sounds.STAIRSUP.play();

        refreshGameObjects();

        // - Switch para atribuir map de acordo com nivel do heroi. (Caso quisermos colocar mais niveis)
        switch(hero.floor){
            case 0 : map = map2; hero.floor++; break;   
        }

        init();
    }

    function calcPoints(){
        hero.pontos = (hero.bones * 15) + (hero.keys * 5) + hero.life;

        let sidePoints = document.getElementById("side-panelPoints");

        sidePoints.innerHTML = "PONTOS: " + hero.pontos;
    }

    // - Função responsável pela vitoria
    function winGame(){
        sounds.WINGAME.play();

        let endModal = document.getElementById("endModal");
        let endModalContent = document.getElementById("inEndModal");
        let buttonEnd = document.getElementById("buttonEnd");

        calcPoints();

        render();
        
        // modal
        let endMessage = "<p>YOU WON! </p>" + "<br>" + "<p>SUA PONTUAÇÃO:" + hero.pontos + "</p>" + "<br>";
        endModal.style.display = "block";
        endModalContent.innerHTML = endMessage;
        
        // pausar movements
        isPlaying = false;

        sendMessage("Fim do jogo");

        window.removeEventListener("keydown",keydownHandler,false);

        buttonEnd.addEventListener("click",function(){
            endModal.style.display = "none";
            document.location.reload(false);
        },false);
    }

    // - Função que acaba o jogo. Ao final, voltar a tela inicial caso jogador queira jogar novamente
    function endGame(){
        sounds.GAMEOVER.play();
        sounds.BACKGROUND.pause();
        // - Variaveis referencias aos ids no html
        let endModal = document.getElementById("endModal");
        let endModalContent = document.getElementById("inEndModal");
        let buttonEnd = document.getElementById("buttonEnd");

        calcPoints();

        render();

        // modal
        let endMessage = "<p>YOU LOSE! </p>" + "<br>" + "<p>SUA PONTUAÇÃO:" + hero.pontos + "</p>" + "<br>";
        endModal.style.display = "block";
        endModalContent.innerHTML = endMessage;
        
        // pausar movements
        isPlaying = false;

        sendMessage("Fim do jogo");

        window.removeEventListener("keydown",keydownHandler,false);

        buttonEnd.addEventListener("click",function(){
            endModal.style.display = "none";
            document.location.reload(false);
        },false);
    }
})();