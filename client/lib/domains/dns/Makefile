MOCHA ?= ../../../../node_modules/.bin/mocha
COMPILERS ?= js:babel/register
REPORTER ?= spec
UI ?= bdd

test:
	@NODE_ENV=test NODE_PATH=test:../../../../client $(MOCHA) --compilers $(COMPILERS) --reporter $(REPORTER) --ui $(UI)

.PHONY: test
