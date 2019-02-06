FROM	debian:jessie

MAINTAINER Automattic

WORKDIR /wp-e2e-tests

# Create empty directories to also support the wrapper repos
RUN	mkdir /wp-e2e-tests-canary /wp-e2e-tests-jetpack /wp-e2e-tests-visdiff /wp-e2e-tests-ie11 /wp-e2e-tests-woocommerce

# Version Numbers
ENV CHROME_VERSION 61.0.3163.79
ENV NVM_VERSION 0.33.2

# Install dependencies
RUN     apt-get -y update && apt-get -y install \
          wget \
          git \
          python \
          make \
          build-essential \
	  curl \
	  unzip \
	  fonts-ipafont-gothic xfonts-100dpi xfonts-75dpi xfonts-scalable xfonts-cyrillic \
	  xvfb \
	  sudo

# Install Google Chrome
RUN wget http://www.slimjetbrowser.com/chrome/lnx/chrome64_$CHROME_VERSION.deb && \
	dpkg -i chrome64_$CHROME_VERSION.deb || \
	apt-get -fy install

# Remove install file
RUN rm -rf /wp-e2e-tests/chrome64_$CHROME_VERSION.deb

# Configure non-root account
RUN	useradd -m e2e-tester
RUN	adduser e2e-tester sudo

# Enable passwordless sudo for users under the "sudo" group
RUN sed -i.bkp -e \
      's/%sudo\s\+ALL=(ALL\(:ALL\)\?)\s\+ALL/%sudo ALL=NOPASSWD:ALL/g' \
      /etc/sudoers

RUN	chown -R e2e-tester /wp-e2e-tests*
USER    e2e-tester

# Install nvm as e2e-tester
RUN     curl -o- https://raw.githubusercontent.com/creationix/nvm/v$NVM_VERSION/install.sh | bash

# Install the current version of NodeJS from .nvmrc
ADD	.nvmrc	/home/e2e-tester
RUN	cd $HOME && \
	export NVM_DIR="$HOME/.nvm" && \
	[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" || \
	nvm install
