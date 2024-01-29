package _self.projects

import _self.bashNodeScript
import jetbrains.buildServer.configs.kotlin.v2019_2.BuildType
import jetbrains.buildServer.configs.kotlin.v2019_2.Project

object Gutenberg : Project({
	id("Gutenberg")
	name = "Gutenberg Core tests"
	description = "Core Gutenberg tests running in the Dotcom environment."

	buildType(GutenbergCoreE2E)
})

object GutenbergCoreE2E: BuildType ({
	name = "E2E tests"
	description = "Runs core E2E tests."

	artifactRules = """
		artifacts => artifacts
	""".trimIndent()

	vcs {
		root(WpGutenberg)
		cleanCheckout = true
	}

	params {
		password("WP_BASE_URL", "credentialsJSON:5cc9ce44-c31a-4591-9f02-cda749351bff");
		password("WP_USERNAME", "credentialsJSON:ab140672-6955-4206-9ae4-df940896992d");
		password("WP_PASSWORD", "credentialsJSON:1b787674-1c6f-41c5-9b39-41768fa1aa0c");
		password("WP_APP_PASSWORD", "credentialsJSON:2f191dbd-7341-4ff9-acab-f5dd0111e364");
		password("WP_CLIENT_ID", "credentialsJSON:7bcd18c5-7ebe-42ab-9f85-45abcea3f21b");
		password("WP_CLIENT_SECRET", "credentialsJSON:87a99f9c-2bf6-43c2-bd43-903f28bec4fb");
	}

	steps {
		bashNodeScript {
			name = "Prepare environment"
			scriptContent = """
				# Install deps
				npm ci
				
				# Build packages
				npm run build:packages
			""".trimIndent()
		}

		bashNodeScript {
			name = "Run Playwright E2E tests"
			scriptContent = """
				# Export env vars
				export WP_BASE_URL="%WP_BASE_URL%"
				export WP_USERNAME="%WP_USERNAME%"
				export WP_PASSWORD="%WP_PASSWORD%"
				export WP_APP_PASSWORD="%WP_APP_PASSWORD%"
				export WP_CLIENT_ID="%WP_CLIENT_ID%"
				export WP_CLIENT_SECRET="%WP_CLIENT_SECRET%"

				# Run suite.
				npm run test:e2e:playwright
			""".trimIndent()
		}
	}
})

object WpGutenberg : GitVcsRoot({
    name = "gutenberg"
    url = "https://github.com/WordPress/gutenberg.git"
    branch = "refs/heads/try/run-e2e-tests-against-wpcom"
})
