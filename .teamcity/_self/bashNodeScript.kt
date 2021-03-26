package _self

import jetbrains.buildServer.configs.kotlin.v2019_2.BuildSteps
import jetbrains.buildServer.configs.kotlin.v2019_2.buildSteps.ScriptBuildStep

/**
 * A default version of the "script" step with node, bash, and docker configured as expected.
 *
 * To use, add `import _self.bashNodeScript`, and then reference exactly like a script step:
 * ```
 * steps {
 *   bashNodeScript {
 *     name = "Hello world!"
 *     scriptContent = """
 *       echo "Hello world!"
 *     """
 *   }
 * }
 * ```
 */
fun BuildSteps.bashNodeScript(init: ScriptBuildStep.() -> Unit): ScriptBuildStep {
	val result = ScriptBuildStep(init)
	result.scriptContent = """
		#!/bin/bash
		# Update node
		. "${'$'}NVM_DIR/nvm.sh" --no-use
		nvm install
		set -o errexit
		set -o nounset
		set -o pipefail

		# Existing script content set by caller:
		${result.scriptContent}
	""".trimIndent()
	result.dockerImagePlatform = ScriptBuildStep.ImagePlatform.Linux
	result.dockerPull = true
	result.dockerImage = result.dockerImage ?: "%docker_image%"
	result.dockerRunParameters = result.dockerRunParameters ?: "-u %env.UID%"
	step(result)
	return result
}
