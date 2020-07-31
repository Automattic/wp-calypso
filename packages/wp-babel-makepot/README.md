wp-babel-makepot

Run babel makepot Running:

```
docker run --init -it -v ~/my/app/source:/src -v ~/my/potfiles:/build wp-babel-makepot
```

Develop

```
git clone https://github.com:Automattic/wp-babel-makepot.git
cd wp-babel-makepot
docker build -t wp-babel-makepot .
docker run --init -it -v ~/wp/calypso/client:/src -v ~/wp/calypso/potfiles:/build wp-babel-makepot
```

Locally (without docker)

```
cd wp-babel-makepot
npm install
npm start "some/src/**/*.js{,x}" -- --ignore "**/node_modules/**,**/*.spec.js,**/*.test.js" --output "./strings.pot"
```
