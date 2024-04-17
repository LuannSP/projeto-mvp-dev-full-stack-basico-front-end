document.addEventListener("DOMContentLoaded", function() {
    navigate('home');
});

document.getElementById('homeLink').addEventListener('click', function(event) {
    event.preventDefault();
    navigate('home');
});

document.getElementById('aboutLink').addEventListener('click', function(event) {
    event.preventDefault();
    navigate('about');
});

function navigate(page) {
    const contentDiv = document.getElementById('content');
    switch(page) {
        case 'home':
            renderHomePage(contentDiv);
            break;
        case 'about':
            renderAboutPage(contentDiv);
            break;
        default:
            renderNotFoundPage(contentDiv);
    }
}

function renderHomePage(contentDiv) {
    contentDiv.innerHTML = `
        <h2>O que você deseja jogar?</h2>
        <p>Seja bem-vindo(a) ao nosso site.</p></br>
        <form id="gameForm">
            <input type="text" id="gameName" maxlength="50" placeholder="DIGITE O NOME DO JOGO" required>
            <button id="addGameButton" type="submit" title="Adicionar um jogo à sua lista"><i class="fas fa-plus"></i></button>
            <button id="searchGameButton" type="submit" title="Procurar um jogo na sua lista"><i class="fas fa-search"></i></button>
        </form>
        </br></br><h3>Jogos:</h3>
        <div id="gamesList"></div>
    `;
    getGameList();

    document.getElementById('gameForm').addEventListener('submit', function(event) {
        event.preventDefault();
        const gameName = document.getElementById('gameName').value.trim();
        if (event.submitter === document.getElementById('addGameButton')) {
            newGame();
        } else {
            if (gameName !== '') {
                searchGameByName(gameName);
            }
        }
    });
}

function renderAboutPage(contentDiv) {
    contentDiv.innerHTML = `
        <h2>Sobre</h2>
        <p>Conheça mais sobre nós aqui.</p>
        <h3>Versão: 1.0</h3>
        <p>Data: 23 de março de 2024</p>
        <p>Autor: Luann Gonçalves</p>
        <p>Descrição: Esta é uma aplicação simples para salvar seus jogos.</p>
    `;
}

function renderNotFoundPage(contentDiv) {
    contentDiv.innerHTML = '<h2>Page Not Found</h2><p>A página solicitada não foi encontrada.</p>';
}

function insertList(gameName) {
    const gamesListDiv = document.getElementById('gamesList');
    const gameDiv = document.createElement('div');
    gameDiv.classList.add('game-item');
    gameDiv.innerHTML = `
        <span>${gameName}</span>
        <button class="removeButton">X</button>
    `;
    const removeButton = gameDiv.querySelector('.removeButton');
    removeButton.addEventListener('click', function() {
        confirmDelete(gameName);
    });
    gamesListDiv.appendChild(gameDiv);
}

const getGameList = async () => {
    try {
        const response = await fetch('http://127.0.0.1:5000/games');
        if (!response.ok) {
            throw new Error('Erro ao buscar a lista de jogos.');
        }
        const data = await response.json();
        data.games.forEach(item => insertList(item.name));
    } catch (error) {
        console.error('Error:', error);
        alert('Erro ao buscar a lista de jogos.');
    }
}

const newGame = async () => {
    const inputGameName = document.getElementById('gameName').value.trim().toUpperCase();
    try {
        const formData = new FormData();
        formData.append('name', inputGameName);
        const response = await fetch('http://127.0.0.1:5000/games', {
            method: 'POST',
            body: formData
        });
        if (!response.ok) {
            throw new Error('Ocorreu um erro ao tentar adicionar o jogo. Parece que o jogo já está cadastrado.');
        }
        document.getElementById('gameName').value = '';
        insertList(inputGameName);
    } catch (error) {
        console.error('Erro:', error);
        alert(error.message);
    }
};

const confirmDelete = (gameName) => {
    const confirmDelete = confirm(`Tem certeza que deseja excluir o jogo "${gameName}"?`);
    if (confirmDelete) {
        deleteGame(gameName);
    }
};

const deleteGame = async (gameName) => {
    try {
        const response = await fetch(`http://127.0.0.1:5000/games?name=${gameName}`, {
            method: 'DELETE'
        });
        if (!response.ok) {
            throw new Error('Erro ao excluir o jogo.');
        }
        const gamesListDiv = document.getElementById('gamesList');
        while (gamesListDiv.firstChild) {
            gamesListDiv.removeChild(gamesListDiv.firstChild);
        }
        await getGameList();
    } catch (error) {
        console.error('Erro:', error);
        alert(error.message);
    }
};

const searchGameByName = async () => {
    const inputGameName = document.getElementById('gameName').value.trim().toUpperCase();
    try {
        const response = await fetch(`http://127.0.0.1:5000/game?name=${inputGameName}`);
        if (response.ok) {
            const data = await response.json();
            const gameItems = document.querySelectorAll('.game-item');
            gameItems.forEach(item => {
                item.classList.remove('selected');
            });
            gameItems.forEach(item => {
                const itemName = item.querySelector('span').textContent.trim().toUpperCase();
                if (itemName === data.name) {
                    item.classList.add('selected');
                }
            });
        } else if (response.status === 404) {
            const gameItems = document.querySelectorAll('.game-item');
            gameItems.forEach(item => {
                item.classList.remove('selected');
            });
            throw new Error('O jogo não foi encontrado.');
        } else {
            throw new Error('Erro ao buscar o jogo.');
        }
    } catch (error) {
        console.error('Erro:', error);
        alert(error.message);
    }
};
