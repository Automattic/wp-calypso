import config from '@automattic/calypso-config';
import {
	AI_ASSEMBLER_FLOW,
	START_WRITING_FLOW,
	CONNECT_DOMAIN_FLOW,
	NEW_HOSTED_SITE_FLOW,
	DESIGN_FIRST_FLOW,
	TRANSFERRING_HOSTED_SITE_FLOW,
	IMPORT_HOSTED_SITE_FLOW,
	DOMAIN_TRANSFER,
	VIDEOPRESS_TV_FLOW,
	VIDEOPRESS_TV_PURCHASE_FLOW,
	GOOGLE_TRANSFER,
	REBLOGGING_FLOW,
	MIGRATION_FLOW,
	SITE_MIGRATION_FLOW,
	MIGRATION_SIGNUP_FLOW,
	ENTREPRENEUR_FLOW,
	IMPORT_FOCUSED_FLOW,
	HOSTED_SITE_MIGRATION_FLOW,
	NEW_HOSTED_SITE_FLOW_USER_INCLUDED,
	ONBOARDING_FLOW,
} from '@automattic/onboarding';
import type { Flow } from '../declarative-flow/internals/types';

const availableFlows: Record< string, () => Promise< { default: Flow } > > = {
	'site-setup': () =>
		import( /* webpackChunkName: "site-setup-flow" */ '../declarative-flow/site-setup-flow' ),
	'site-setup-wg': () =>
		import( /* webpackChunkName: "site-setup-wg" */ '../declarative-flow/site-setup-wg-flow' ),

	'copy-site': () =>
		import( /* webpackChunkName: "copy-site-flow" */ '../declarative-flow/copy-site' ),

	newsletter: () =>
		import( /* webpackChunkName: "newsletter-flow" */ '../declarative-flow/newsletter' ),

	[ IMPORT_FOCUSED_FLOW ]: () =>
		import( /* webpackChunkName: "import-flow" */ '../declarative-flow/import-flow' ),

	videopress: () =>
		import( /* webpackChunkName: "videopress-flow" */ '../declarative-flow/videopress' ),

	'link-in-bio': () =>
		import( /* webpackChunkName: "link-in-bio-flow" */ '../declarative-flow/link-in-bio' ),
	'link-in-bio-tld': () =>
		import( /* webpackChunkName: "link-in-bio-tld-flow" */ '../declarative-flow/link-in-bio-tld' ),

	'link-in-bio-post-setup': () =>
		import(
			/* webpackChunkName: "link-in-bio-post-setup-flow" */ '../declarative-flow/link-in-bio-post-setup'
		),

	'newsletter-post-setup': () =>
		import(
			/* webpackChunkName: "newsletter-post-setup-flow" */ '../declarative-flow/newsletter-post-setup'
		),

	ecommerce: () =>
		import(
			/* webpackChunkName: "tailored-ecommerce-flow" */ '../declarative-flow/tailored-ecommerce-flow'
		),

	[ ENTREPRENEUR_FLOW ]: () =>
		import( /* webpackChunkName: "entrepreneur-flow" */ '../declarative-flow/entrepreneur-flow' ),

	wooexpress: () =>
		import(
			/* webpackChunkName: "trial-wooexpress-flow" */ '../declarative-flow/trial-wooexpress-flow'
		),

	free: () => import( /* webpackChunkName: "free-flow" */ '../declarative-flow/free' ),

	'with-theme-assembler': () =>
		import( /* webpackChunkName: "with-theme-assembler-flow" */ './with-theme-assembler-flow' ),

	'assembler-first': () =>
		import( /* webpackChunkName: "assembler-first-flow" */ './assembler-first-flow' ),

	'readymade-template': () =>
		import( /* webpackChunkName: "readymade-template-flow" */ './readymade-template' ),

	[ AI_ASSEMBLER_FLOW ]: () =>
		import( /* webpackChunkName: "ai-assembler-flow" */ './ai-assembler' ),

	'free-post-setup': () =>
		import( /* webpackChunkName: "free-post-setup-flow" */ '../declarative-flow/free-post-setup' ),

	'update-design': () =>
		import( /* webpackChunkName: "update-design-flow" */ '../declarative-flow/update-design' ),

	'update-options': () =>
		import( /* webpackChunkName: "update-options-flow" */ '../declarative-flow/update-options' ),

	'domain-upsell': () =>
		import( /* webpackChunkName: "update-design-flow" */ '../declarative-flow/domain-upsell' ),

	build: () => import( /* webpackChunkName: "build-flow" */ '../declarative-flow/build' ),
	write: () => import( /* webpackChunkName: "write-flow" */ '../declarative-flow/write' ),

	sensei: () => import( /* webpackChunkName: "sensei-flow" */ '../declarative-flow/sensei' ),

	blog: () => import( /* webpackChunkName: "blog" */ '../declarative-flow/blog' ),

	[ START_WRITING_FLOW ]: () =>
		import( /* webpackChunkName: "start-writing-flow" */ './start-writing' ),

	[ DESIGN_FIRST_FLOW ]: () =>
		import( /* webpackChunkName: "design-first-flow" */ './design-first' ),

	[ CONNECT_DOMAIN_FLOW ]: () =>
		import( /* webpackChunkName: "connect-domain" */ '../declarative-flow/connect-domain' ),

	[ NEW_HOSTED_SITE_FLOW ]: () =>
		import( /* webpackChunkName: "new-hosted-site-flow" */ './new-hosted-site-flow' ),

	[ NEW_HOSTED_SITE_FLOW_USER_INCLUDED ]: () =>
		import(
			/* webpackChunkName: "new-hosted-site-flow-user-included" */ './new-hosted-site-flow-user-included'
		),

	[ TRANSFERRING_HOSTED_SITE_FLOW ]: () =>
		import(
			/* webpackChunkName: "transferring-hosted-site-flow" */ './transferring-hosted-site-flow'
		),
	[ IMPORT_HOSTED_SITE_FLOW ]: () =>
		import( /* webpackChunkName: "import-hosted-site-flow" */ './import-hosted-site' ),

	[ DOMAIN_TRANSFER ]: () =>
		import( /* webpackChunkName: "domain-transfer" */ './domain-transfer' ),

	[ GOOGLE_TRANSFER ]: () =>
		import( /* webpackChunkName: "google-transfer" */ './google-transfer' ),

	[ ONBOARDING_FLOW ]: () => import( /* webpackChunkName: "onboarding-flow" */ './onboarding' ),

	[ 'plugin-bundle' ]: () =>
		import( /* webpackChunkName: "plugin-bundle-flow" */ '../declarative-flow/plugin-bundle-flow' ),

	[ 'hundred-year-plan' ]: () =>
		import( /* webpackChunkName: "hundred-year-plan" */ './hundred-year-plan' ),

	'domain-user-transfer': () =>
		import( /* webpackChunkName: "domain-user-transfer-flow" */ './domain-user-transfer' ),

	[ REBLOGGING_FLOW ]: () =>
		import( /* webpackChunkName: "reblogging-flow" */ '../declarative-flow/reblogging' ),

	[ MIGRATION_SIGNUP_FLOW ]: () =>
		import( /* webpackChunkName: "migration-signup" */ '../declarative-flow/migration-signup' ),
	[ SITE_MIGRATION_FLOW ]: () =>
		import(
			/* webpackChunkName: "site-migration-flow" */ '../declarative-flow/site-migration-flow'
		),
	[ MIGRATION_FLOW ]: () =>
		import( /* webpackChunkName: "migration-flow" */ '../declarative-flow/migration' ),
};

const videoPressTvFlows: Record< string, () => Promise< { default: Flow } > > = config.isEnabled(
	'videopress-tv'
)
	? {
			[ VIDEOPRESS_TV_FLOW ]: () =>
				import( /* webpackChunkName: "videopress-tv-flow" */ `../declarative-flow/videopress-tv` ),

			[ VIDEOPRESS_TV_PURCHASE_FLOW ]: () =>
				import(
					/* webpackChunkName: "videopress-tv-flow" */
					`../declarative-flow/videopress-tv-purchase`
				),
	  }
	: {};

const hostedSiteMigrationFlow: Record< string, () => Promise< { default: Flow } > > = {
	[ HOSTED_SITE_MIGRATION_FLOW ]: () =>
		import(
			/* webpackChunkName: "hosted-site-migration-flow" */ '../declarative-flow/hosted-site-migration-flow'
		),
};

export default {
	...availableFlows,
	...videoPressTvFlows,
	...hostedSiteMigrationFlow,
};
