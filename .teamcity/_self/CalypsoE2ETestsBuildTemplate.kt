package _self

import jetbrains.buildServer.configs.kotlin.v2019_2.*

object CalypsoE2ETestsBuildTemplate : Template({
    name = "Calypso E2E Tests Build Template"
    description = "Runs Calypso Playwright e2e tests using Playwright Test runner"

    vcs {
		root(Settings.WpCalypso)
		cleanCheckout = true
	}
})
