package _self.lib.playwright

import jetbrains.buildServer.configs.kotlin.v2019_2.buildSteps.ScriptBuildStep

/**
 * Prepares the environment to run Playwright tests.
 *
 * This will generate a Script step that:
 *
 * - Updates node
 * - Set some env variables
 * - Installs dependencies for @automattic/calypso-e2e and builds it
 * - Installs dependencies for wp-e2e-tests
 *
 * It uses Yarn focus mode (https://yarnpkg.com/cli/workspaces/focus) to minimize the dependencies
 * installed and save some time. Yarn may throw some warnings about unused overrides, but they are safe to ignore.
 */
fun prepareEnvironment(): ScriptBuildStep {
	return ScriptBuildStep {
		scriptContent = """
			#!/bin/bash
			# Update node
			. "${'$'}NVM_DIR/nvm.sh" --no-use
			nvm install
			set -o errexit
			set -o nounset
			set -o pipefail

			export NODE_ENV="test"
			export PLAYWRIGHT_BROWSERS_PATH=0

			# Install deps
			yarn workspaces focus wp-e2e-tests @automattic/calypso-e2e

			# Build packages
			yarn workspace @automattic/calypso-e2e build
		""".trimIndent()
		dockerImagePlatform = ScriptBuildStep.ImagePlatform.Linux
		dockerPull = true
		dockerImage = "%docker_image_e2e%"
		dockerRunParameters = "-u %env.UID%"
	}
}
