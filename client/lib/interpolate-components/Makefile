REPORTER ?= spec
MOCHA ?= ./node_modules/.bin/mocha

test:
	@NODE_ENV=test NODE_PATH=test:../../../client $(MOCHA) --compilers jsx:babel/register --reporter $(REPORTER)

publish:
	@babel -sd lib/ src/
	@npm publish

.PHONY: test
