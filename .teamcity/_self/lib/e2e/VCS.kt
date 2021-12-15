package _self.lib.e2e

import jetbrains.buildServer.configs.kotlin.v2019_2.BuildType

/**
 *
 */
fun BuildType.wpCalypsoVCS( enforceCleanCheckout: Boolean = true ): Unit {
	return vcs {
		root(Settings.WpCalypso)
		cleanCheckout = enforceCleanCheckout
	}
}
