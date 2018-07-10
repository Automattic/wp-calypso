#!/bin/bash

# Uses phpbrew to install older php versions on modern(ish) distros.
# Installs the correct version of phpunit for the requested php
# version. ~/.phpbrew is expected to be cached so we only have
# to build php the first time.

# we have to save and restore the original working directory, because
# phpbrew can mess up if we don't run it from the home directory
ORIG_DIR=`pwd`;
THIS_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PHP52_PATH=$HOME/.phpbrew/php/php-5.2.17

# install phpunit

mkdir -p $HOME/phpunit-bin

if [[ ${SWITCH_TO_PHP:0:3} == "5.2" ]]; then
  # use the phpunit in the PHP5.2 installation
  ln -s ${PHP52_PATH}/lib/php/phpunit/phpunit.php $HOME/phpunit-bin/phpunit
elif [[ ${TRAVIS_PHP_VERSION:0:2} == "5." ]] || [[ ${SWITCH_TO_PHP:0:2} == "5." ]]; then
  wget -O $HOME/phpunit-bin/phpunit https://phar.phpunit.de/phpunit-4.8.phar
  chmod +x $HOME/phpunit-bin/phpunit
else
  composer global require "phpunit/phpunit=6.*"
fi

export PATH=$HOME/phpunit-bin/:$PATH

if [[ ${SWITCH_TO_PHP:0:3} == "5.2" ]] || [[ ${SWITCH_TO_PHP:0:3} == "5.3" ]]; then
  PHPBREW_BUILT_CHECK=$HOME/.phpbrew/bashrc

  # directory to install phpbrew into
  mkdir -p $HOME/php-utils-bin

  # install phpbrew
  curl -L -o $HOME/php-utils-bin/phpbrew https://github.com/phpbrew/phpbrew/raw/f6a422e1ba49293ee73bc4c317795c021bc57020/phpbrew
  chmod +x $HOME/php-utils-bin/phpbrew

  # needs to be on the path for switching php versions to work
	export PATH=$HOME/php-utils-bin:$PATH

  # php and phpunit3.6 installs should be cached, only build if they're not there.
  if [ ! -f $PHPBREW_BUILT_CHECK ]; then
    
    # init with known --old to get 5.2 and 5.3
    $HOME/php-utils-bin/phpbrew init
    $HOME/php-utils-bin/phpbrew known --old

    # build PHP5.2
    echo 'Installing PHP 5.2...'
    $HOME/php-utils-bin/phpbrew install --patch ${THIS_DIR}/patches/node.patch --patch ${THIS_DIR}/patches/openssl.patch 5.2 +default +mysql +pdo \
    +gettext +phar +openssl -- --with-openssl-dir=/usr/include/openssl --enable-spl --with-mysql --with-mysqli=/usr/bin/mysql_config --with-pdo-mysql=/usr \
    > /dev/null

    # build PHP5.3
    echo 'Installing PHP 5.3...'
    $HOME/php-utils-bin/phpbrew install --patch ${THIS_DIR}/patches/node.patch --patch ${THIS_DIR}/patches/openssl.patch 5.3 +default +mysql +pdo \
    +gettext +phar +openssl -- --with-openssl-dir=/usr/include/openssl --enable-spl --with-mysql --with-mysqli=/usr/bin/mysql_config --with-pdo-mysql=/usr \
    > /dev/null

    # install PHPUnit 3.6. The only install method available is from source, using git branches old
    # enough that they don't rely on any PHP5.3+ features. This clones each needed dependency
    # and then we add the paths to the include_path by setting up an extra .ini file
    cd ${PHP52_PATH}/lib/php

    # dependencies
    git clone --depth=1 --branch=1.1   git://github.com/sebastianbergmann/dbunit.git
    git clone --depth=1 --branch=1.1   git://github.com/sebastianbergmann/php-code-coverage.git
    git clone --depth=1 --branch=1.3.2 git://github.com/sebastianbergmann/php-file-iterator.git
    git clone --depth=1 --branch=1.1.1 git://github.com/sebastianbergmann/php-invoker.git
    git clone --depth=1 --branch=1.1.2 git://github.com/sebastianbergmann/php-text-template.git
    git clone --depth=1 --branch=1.0.3 git://github.com/sebastianbergmann/php-timer.git
    git clone --depth=1 --branch=1.1.4 git://github.com/sebastianbergmann/php-token-stream.git
    git clone --depth=1 --branch=1.1   git://github.com/sebastianbergmann/phpunit-mock-objects.git
    git clone --depth=1 --branch=1.1   git://github.com/sebastianbergmann/phpunit-selenium.git
    git clone --depth=1 --branch=1.0.0 git://github.com/sebastianbergmann/phpunit-story.git

    # and the version of phpunit that we expect to run with php 5.2
    git clone --depth=1 --branch=3.6   git://github.com/sebastianbergmann/phpunit.git

    # fix up the version number of phpunit
    sed -i 's/@package_version@/3.6-git/g' phpunit/PHPUnit/Runner/Version.php

    # now set up an ini file that adds all of the above to include_path for the PHP5.2 install
    mkdir -p ${PHP52_PATH}/var/db
    echo "include_path=.:${PHP52_PATH}/lib/php:${PHP52_PATH}/lib/php/dbunit:${PHP52_PATH}/lib/php/php-code-coverage:${PHP52_PATH}/lib/php/php-file-iterator:${PHP52_PATH}/lib/php/php-invoker:${PHP52_PATH}/lib/php/php-text-template:${PHP52_PATH}/lib/php/php-timer:${PHP52_PATH}/lib/php/php-token-stream:${PHP52_PATH}/lib/php/phpunit-mock-objects:${PHP52_PATH}/lib/php/phpunit-selenium:${PHP52_PATH}/lib/php/phpunit-story:${PHP52_PATH}/lib/php/phpunit" > ${PHP52_PATH}/var/db/path.ini

    # one more PHPUnit dependency that we need to install using pear under PHP5.2
    cd $HOME
    export PHPBREW_RC_ENABLE=1
    source $HOME/.phpbrew/bashrc
    phpbrew use 5.2.17
    pear channel-discover pear.symfony-project.com
    pear install pear.symfony-project.com/YAML-1.0.2

    # manually go back to the system php, we can't use `phpbrew switch-off`
    # because we're running a version of php that phpbrew doesn't work with at this point
    unset PHPBREW_PHP
    unset PHPBREW_PATH
    __phpbrew_set_path
    __phpbrew_reinit
    eval `$BIN env`

    # clean up build directory
    rm -rf $HOME/.phpbrew/build/*
  fi

  # all needed php versions and phpunit versions are installed, either from the above
  # install script, or from travis cache, so switch to using them
  cd $HOME
  export PHPBREW_RC_ENABLE=1
  source $HOME/.phpbrew/bashrc

  if [[ ${SWITCH_TO_PHP:0:3} == "5.2" ]]; then
    phpbrew use 5.2.17
  else
    phpbrew use 5.3.29
  fi
fi

cd $ORIG_DIR
