package _self

import jetbrains.buildServer.configs.kotlin.v2019_2.*

object Calypso_e2e_Tests_BuildTemplate : Template({
    name = "Calypso E2E Tests Build Template"
    description = "Runs Calypso Playwright e2e tests using Playwright Test runner"

    vcs {
		root(Settings.WpCalypso)
		cleanCheckout = true
	}
})
