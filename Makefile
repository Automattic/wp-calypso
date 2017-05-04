.DEFAULT_GOAL := install

install:
	npm run install-if-needed

run:
	npm start

dashboard:
	npm run dashboard

test:
	npm test

lint:
	npm run lint

eslint:
	npm run lint

eslint-branch:
	npm run eslint-branch

mixedindentlint:
	npm run lint:mixedindent

config-defaults-lint:
	npm run lint:config-defaults

build-server:
	npm run build-server

build:
	npm run build

build-desktop:
	npm run build-desktop

clean:
	npm run clean

distclean:
	npm run distclean

translate:
	npm run translate

shrinkwrap:
	npm run update-deps

analyze-bundles:
	npm run analyze-bundles

urn:
	@printf "⚱\n\n";
	npm start;

docker-build:
	npm run docker-build

docker-run:
	npm run docker
