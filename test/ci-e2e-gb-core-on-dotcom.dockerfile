#### ci-e2e-gb-core-on-dotcom image
#### This image is used to run core E2E tests on dotcom
FROM  node:20.11.1-bullseye-slim as ci-e2e-gb-core-on-dotcom

# Set shell to bash and enable pipefail option
SHELL ["/bin/bash", "-o", "pipefail", "-c"]

# Environment variables for Playwright and display settings
ENV PLAYWRIGHT_SKIP_DOWNLOAD=false \
		DISPLAY=:99

# Install necessary dependencies including Python and build tools
RUN apt-get update && apt-get install -y --no-install-recommends \
				fonts-noto-cjk \
				fonts-noto-core \
				git-restore-mtime \
				libasound2 \
				libatspi2.0-0 \
				libdbus-glib-1-2 \
				libgtk-3-0 \
				libgbm1 \
				libnspr4 \
				libnss3 \
				libsecret-1-0 \
				libx11-xcb1 \
				libxss1 \
				libxtst6 \
				openssl \
				xauth \
				xvfb \
				python3 \
				python3-pip \
				build-essential \
				git \
		&& apt-get autoremove --purge \
		&& apt-get autoclean \
		&& rm -rf /var/lib/apt/lists/* \
		&& ln -s /usr/bin/python3 /usr/bin/python

# Set the working directory
WORKDIR /workspace

ENTRYPOINT [ "/bin/bash" ]
