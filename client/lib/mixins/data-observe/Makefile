REPORTER ?= spec
MOCHA ?= ../../../../node_modules/.bin/mocha

test:
	@NODE_ENV=test NODE_PATH=test:../../../../client $(MOCHA) --reporter $(REPORTER)

.PHONY: test
