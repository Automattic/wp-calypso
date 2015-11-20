REPORTER ?= spec
MOCHA ?= ../../node_modules/.bin/mocha
BABEL ?= ../../node_modules/.bin/babel

test: test/out
	@NODE_ENV=development NODE_PATH=../ $(MOCHA) --reporter $(REPORTER)

	@$(MAKE) clean

test/out: test/examples
	@$(BABEL) test/examples --out-dir test/out > /dev/null

clean:
	@rm -rf test/out
.PHONY: test
