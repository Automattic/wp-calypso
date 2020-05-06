FROM circleci/node:12.16.2-browsers

WORKDIR /home/circleci/wp-calypso/
RUN git clone https://github.com/Automattic/wp-calypso.git . \
	&& git remote set-url origin git@github.com:Automattic/wp-calypso.git \
	&& yarn
