REPORTER ?= spec
BABEL ?= ./node_modules/.bin/babel
MOCHA ?= ./node_modules/.bin/mocha

test:
	@NODE_ENV=test NODE_PATH=test:../../../client $(MOCHA) --compilers jsx:babel/register --reporter $(REPORTER)

publish:
	@npm install
	@make test
	$(BABEL) -sd lib/ src/
	@npm publish
	rm -rf lib
	rm -rf node_modules

.PHONY: test
