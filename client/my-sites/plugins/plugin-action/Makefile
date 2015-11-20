REPORTER ?= spec
MOCHA ?= ../../../../node_modules/.bin/mocha

test:
	@NODE_ENV=test NODE_PATH=test:../../../ $(MOCHA) --compilers jsx:babel/register --reporter $(REPORTER)

.PHONY: test
