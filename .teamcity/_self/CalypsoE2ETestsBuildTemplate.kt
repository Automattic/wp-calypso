package _self

import jetbrains.buildServer.configs.kotlin.v2019_2.*

object CalypsoE2ETestsBuildTemplate : Template({
	name = "Calypso E2E Tests Build Template"
  description = "Runs Calypso Playwright e2e tests using Playwright Test runner"

  vcs {
		root(Settings.WpCalypso)
		cleanCheckout = true
	}

  params {
		param("env.NODE_CONFIG_ENV", "test")
		param("env.PLAYWRIGHT_BROWSERS_PATH", "0")
		param("env.LOCALE", "en")
		param("env.AUTHENTICATE_ACCOUNTS", "simpleSitePersonalPlanUser,gutenbergSimpleSiteUser,defaultUser")
		param("env.CI", "true")
	}

  features {
		perfmon {
		}
		xmlReport {
        	reportType = XmlReport.XmlReportType.JUNIT
        	rules = "+:test/e2e/output/results.xml"
			verbose = true
        }
	}

  steps {
		mergeTrunk( skipIfConflict = true )
  }
})
