babel = node_modules/.bin/babel
webpack = node_modules/.bin/webpack
eslint = node_modules/.bin/eslint
mocha = node_modules/.bin/mocha

# Source files root directory
ROOT := lib index.js

# The directory to place the compiled .js and .json files.
BUILDDIR = build

SOURCE_FILES = $(shell find $(ROOT) -name "*.js")
COMPILED_FILES = $(addprefix $(BUILDDIR)/, $(SOURCE_FILES))

JS_FILES := $(SOURCE_FILES) $(wildcard test/*.js)
JS_TESTING_FILES := $(wildcard test/test*.js test-whitelist/test*.js)

all: build build/wpcom.js

build: $(COMPILED_FILES)

$(BUILDDIR)/%.js: %.js
	@mkdir -p $(dir $@)
	@echo JS source file: "$<" → "$@"
	@$(babel) "$<" --source-maps --out-file "$@"

build/wpcom.js: build
	@$(webpack) --config ./webpack.config.js

install: node_modules

node_modules:
	@yarn
	@touch node_modules

lint:
	@$(eslint) $(JS_FILES)

eslint: lint

test:
	@$(mocha) \
		--timeout 120s \
		--slow 3s \
		--bail \
		--reporter spec \
		--require @babel/register \
		test/

test-watch:
	@$(mocha) \
		--timeout 120s \
		--slow 3s \
		--bail \
		--reporter spec \
		--require @babel/register \
		--watch \
		test/

clean:
	@rm -rfv $(BUILDDIR)

distclean:
	@rm -rfv node_modules

.PHONY: all test test-watch node_modules lint eslint clean distclean
