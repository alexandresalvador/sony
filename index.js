const express = require('express');

const jwt = require('jsonwebtoken');
const app = express();

const JWTSecret = '070eb0cf-f051-499d-b8b3-b13017a936e6';

// transformar em json

app.use(express.urlencoded({ extendend: false }));
app.use(express.json());

// criar banco de dados

const DB = {
    games: [
        {
            id: 1,
            title: 'Dino Crisis',
            year: '2002',
        },
        {
            id: 2,
            title: 'Tomb Raider',
            year: '1996',
        },
    ],
    users: [
        {
            id: 1,
            email: 'joe.doe@gmail.com',
            password: 'teste123'
        },
        {
            id: 2,
            email: 'alexandre.slv@gmail.com',
            password: 'node123'
        },
        {
            id: 3,
            email: 'andre.souza@gmail.com',
            password: 'admin123'
        },
    ]
}
// auth é o nosso middleware

function auth(req, res, next) {
    const authToken = req.headers['authorization'];
    console.log(authToken)

    if(authToken !== undefined) {
        // dividindo nosso token em 2 partes
        const bearer = authToken.split( ' ')
        console.log('BEARER', bearer);

        const token = bearer[1];

        jwt.verify(token, JWTSecret, (err, data) => {
            if(err) {
                res.status(401);
                res.json({message: 'ERR6 - Token invalido'})
            }else {
                console.log(data);
                res.token = token;
            }
        });
    } else {
        res.status(401);
        res.json({message: 'ERR7: Ops, essa rota está protegida, mão é possível acessar'})
    }
    next();
}


app.get('/games', auth, (req, res) => {
    // res.json({ message: 'GAMES UP' });
    // endpoint games
    res.json(DB.games);
});

app.get('/users', (req, res) => {
    // endpoint users
    res.json(DB.users);
});

//endpoint de autenticacao dos meus usuarios

app.post('/auth', (req, res) => {
    const { email, password } = req.body;
    if (email !== undefined) {
        const user = DB.users.find(u => u.email === email);
        if (user !== undefined) {
            if (user.password === password) {
                // gerando o nosso token assim que o usuario fez login com sucesso
                // as informaçoes do payload do token serão id e email
                // assinatura do token
                jwt.sign({
                    id: user.id,
                    email: user.email,
                }, JWTSecret, { // checando  a chave secreta da minha aplicação
                    expiresIn: '1h' // tempo de expiração do token
                }, (err, token) => {
                    if (err) {
                        console.log(err);
                        res.status(400);
                        res.json({ message: 'ERR5: Ops, não foi possível gerar o token' });
                    } else {
                        res.status(200);
                        // res.json({message: 'Usuario logado com sucesso, token enviado.'})
                        res.json({ token });
                    }
                })
            } else {
                res.status(401)
                res.json({ message: 'ERR2: Email ou password não coincidem.' });
            }
        } else {
            res.status(404),
                res.json({ message: 'ERR3: Ops, usuario não existe.' })
        }
    } else {
        res.status(400);
        res.json({ message: 'ERR1: Email ou password não podem ser nulos.' })
    }
})

app.listen(5000, () => {
    console.log('Sony API -> http://localhost:5000');
})