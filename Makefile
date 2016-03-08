# get Makefile directory name: http://stackoverflow.com/a/5982798/376773
THIS_MAKEFILE_PATH:=$(word $(words $(MAKEFILE_LIST)),$(MAKEFILE_LIST))
THIS_DIR:=$(shell cd $(dir $(THIS_MAKEFILE_PATH));pwd)

empty:=
space:=$(empty) $(empty)
THIS_DIR:= $(subst $(space),\$(space),$(THIS_DIR))
ifeq ($(OS),Windows_NT)
SEPARATOR := ;
else
SEPARATOR := :
endif

# BIN
BIN := $(THIS_DIR)/bin

# NODE BIN folder
NODE_BIN := $(THIS_DIR)/node_modules/.bin

# applications
NODE ?= node
NPM ?= npm
BUNDLER ?= $(BIN)/bundler
SASS ?= $(NODE_BIN)/node-sass --include-path 'client'
RTLCSS ?= $(NODE_BIN)/rtlcss
AUTOPREFIXER ?= $(NODE_BIN)/autoprefixer
RECORD_ENV ?= $(BIN)/record-env
GET_I18N ?= $(BIN)/get-i18n
I18NLINT ?= $(BIN)/i18nlint
LIST_ASSETS ?= $(BIN)/list-assets
ALL_DEVDOCS_JS ?= ./server/devdocs/bin/generate-devdocs-index

# files used as prereqs
SASS_FILES := $(shell \
	find client assets \
		-type f \
		-name '*.scss' \
)
JS_FILES := $(shell \
	find . \
		-not \( -path './.git' -prune \) \
		-not \( -path './build' -prune \) \
		-not \( -path './node_modules' -prune \) \
		-not \( -path './public' -prune \) \
		-type f \
		\( -name '*.js' -or -name '*.jsx' \) \
)
MD_FILES := $(shell \
	find . \
		-not \( -path './.git' -prune \) \
		-not \( -path './build' -prune \) \
		-not \( -path './node_modules' -prune \) \
		-not \( -path './public' -prune \) \
		-type f \
		-name '*.md' \
	| sed 's/ /\\ /g' \
)
CLIENT_CONFIG_FILE := client/config/index.js

# variables
NODE_ENV ?= development
CALYPSO_ENV ?= $(NODE_ENV)

export NODE_ENV := $(NODE_ENV)
export CALYPSO_ENV := $(CALYPSO_ENV)
export NODE_PATH := server$(SEPARATOR)client$(SEPARATOR).

# We use `semver` to check the version of Node.js before installing npm
# packages or running scripts.  Since this is before npm runs, we need to grab
# the version of `semver` installed with the npm executable.
ifeq ($(OS),Windows_NT)
# On Windows, the npm global install path is under AppData:
# http://stackoverflow.com/a/26894197
# `semver` is in the base `node_modules` folder for the `node` installation.
export SEMVER_GLOBAL_PATH := $(dir $(shell which $(NODE)))/node_modules/npm/node_modules/semver
else
# On OS X and Linux, npm is just a globally installed npm package.
export SEMVER_GLOBAL_PATH := $(shell $(NPM) -g root)/npm/node_modules/semver
endif

.DEFAULT_GOAL := install

welcome:
	@printf "\033[36m             _                           \n"
	@printf "\033[36m    ___ __ _| |_   _ _ __  ___  ___      \n"
	@printf "\033[36m   / __/ _\` | | | | | '_ \/ __|/ _ \\   \n"
	@printf "\033[36m  | (_| (_| | | |_| | |_) \__ \ (_) |    \n"
	@printf "\033[36m   \___\__,_|_|\__, | .__/|___/\___/     \n"
	@printf "\033[36m               |___/|_|                  \n"
	@printf "\033[m\n"

install:
	@$(NPM) run bootstrap
	@$(NPM) install

# Simply running `make run` will spawn the Node.js server instance.
run: welcome githooks install build
	@$(NODE) build/bundle-$(CALYPSO_ENV).js

# run `make test` in all discovered Makefiles
test: build
	@$(BIN)/run-all-tests

lint: node_modules/eslint node_modules/eslint-plugin-react node_modules/babel-eslint mixedindentlint
	@$(NPM) run lint

eslint: lint

eslint-branch: node_modules/eslint node_modules/eslint-plugin-react node_modules/babel-eslint
	@git diff --name-only $$(git merge-base $$(git rev-parse --abbrev-ref HEAD) master)..HEAD | grep '\.jsx\?$$' | xargs $(NODE_BIN)/eslint --cache

# Skip test directories (with the sed regex) for i18nlint in lieu of proper
# ignore functionality
i18n-lint:
	@echo "$(JS_FILES)" | sed 's/\([^ ]*\/test\/[^ ]* *\)//g' | xargs -n1 $(I18NLINT)

# Skip files that are auto-generated
mixedindentlint: node_modules/mixedindentlint
	@echo "$(JS_FILES)\n$(SASS_FILES)" | xargs $(NODE_BIN)/mixedindentlint --ignore-comments --exclude="client/config/index.js" --exclude="client/components/gridicon/index.jsx"

# keep track of the current CALYPSO_ENV so that it can be used as a
# prerequisite for other rules
.env: FORCE
	@$(RECORD_ENV) $@

# generate the client-side `config` js file
$(CLIENT_CONFIG_FILE): .env config/$(CALYPSO_ENV).json config/client.json server/config/regenerate-client.js
	@$(NODE) server/config/regenerate-client.js > $@

public/style.css: node_modules $(SASS_FILES)
	@$(SASS) assets/stylesheets/style.scss $@
	@$(AUTOPREFIXER) $@

public/style-debug.css: node_modules $(SASS_FILES)
	@$(SASS) --source-map "$(@D)/style-debug.css.map" assets/stylesheets/style.scss $@
	@$(AUTOPREFIXER) $@

public/style-rtl.css: public/style.css
	@$(RTLCSS) $(THIS_DIR)/public/style.css $@

public/editor.css: node_modules $(SASS_FILES)
	@$(SASS) assets/stylesheets/editor.scss $@
	@$(AUTOPREFIXER) $@

server/devdocs/search-index.js: $(MD_FILES) $(ALL_DEVDOCS_JS)
	@$(NODE) $(ALL_DEVDOCS_JS) $(MD_FILES)

build-server: install
	@mkdir -p build
	@CALYPSO_ENV=$(CALYPSO_ENV) $(NODE_BIN)/webpack --display-error-details --config webpack.config.node.js

build: install build-$(CALYPSO_ENV)

build-css: public/style.css public/style-rtl.css public/style-debug.css public/editor.css

build-development: build-server $(CLIENT_CONFIG_FILE) server/devdocs/search-index.js build-css

build-wpcalypso: build-server $(CLIENT_CONFIG_FILE) server/devdocs/search-index.js build-css
	@$(BUNDLER)

build-desktop build-desktop-mac-app-store build-horizon build-stage build-production: build-server $(CLIENT_CONFIG_FILE) build-css
	@$(BUNDLER)

# create list of translations, saved as `./calypso-strings.php`
translate: node_modules $(CLIENT_CONFIG_FILE)
	@CALYPSO_ENV=stage $(BUNDLER)
	@CALYPSO_ENV=stage $(LIST_ASSETS) | xargs $(GET_I18N) ./calypso-strings.php calypso_i18n_strings

# rule that can be used as a prerequisite for other rules to force them to always run
FORCE:

.PHONY: build build-development build-server
.PHONY: run install test translate route node-version
.PHONY: githooks githooks-commit githooks-push
