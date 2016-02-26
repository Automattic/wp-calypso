REPORTER ?= spec

ifneq ("$(wildcard node_modules/.bin/)","")
NODE_BIN ?= ./node_modules/.bin
else
NODE_BIN ?= ../../../node_modules/.bin
endif

BABEL ?= $(NODE_BIN)/babel
MOCHA ?= $(NODE_BIN)/mocha

test:
	@NODE_ENV=test NODE_PATH=test $(MOCHA) --compilers jsx:babel/register --reporter $(REPORTER)

publish:
	@npm install
	@make test
	$(BABEL) -sd lib/ src/
	@npm publish
	rm -rf lib
	rm -rf node_modules

.PHONY: test
