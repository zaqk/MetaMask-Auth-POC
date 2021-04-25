MetaMask JWT token auth Proof of concept

All relevant code is in my-app/src/App.js

4 API calls are made on page load:
* GET /api/secret (should fail)
* GET /api/login
* POST /api/login (authenticates user)
* GET /api/secret (should succeed with JWT Authorization header set)

```
my-app
├── README.md
├── node_modules
├── package.json
├── .gitignore
├── public
│   ├── favicon.ico
│   ├── index.html
│   └── manifest.json
└── src
    ├── App.css
    ├── App.js
    ├── App.test.js
    ├── index.css
    ├── index.js
    ├── logo.svg
    └── serviceWorker.js
    └── setupTests.js
```

```sh
cd my-app
```

### `yarn start`

Runs the app in development mode.<br>
