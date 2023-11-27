import config from '@automattic/calypso-config';
import {
	AI_ASSEMBLER_FLOW,
	LINK_IN_BIO_DOMAIN_FLOW,
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
	AGENCY_HOSTED_SITE_FLOW,
} from '@automattic/onboarding';
import type { Flow } from '../declarative-flow/internals/types';

const availableFlows: Record< string, () => Promise< { default: Flow } > > = {
	'site-setup': () =>
		import( /* webpackChunkName: "site-setup-flow" */ '../declarative-flow/site-setup-flow' ),

	'copy-site': () =>
		import( /* webpackChunkName: "copy-site-flow" */ '../declarative-flow/copy-site' ),

	newsletter: () =>
		import( /* webpackChunkName: "newsletter-flow" */ '../declarative-flow/newsletter' ),

	'import-focused': () =>
		import( /* webpackChunkName: "import-flow" */ '../declarative-flow/import-flow' ),

	videopress: () =>
		import( /* webpackChunkName: "videopress-flow" */ '../declarative-flow/videopress' ),

	'link-in-bio': () =>
		import( /* webpackChunkName: "link-in-bio-flow" */ '../declarative-flow/link-in-bio' ),

	[ LINK_IN_BIO_DOMAIN_FLOW ]: () =>
		import(
			/* webpackChunkName: "link-in-bio-flow-domain" */ '../declarative-flow/link-in-bio-domain'
		),

	'link-in-bio-tld': () =>
		import( /* webpackChunkName: "link-in-bio-tld-flow" */ '../declarative-flow/link-in-bio-tld' ),

	podcasts: () => import( /* webpackChunkName: "podcasts-flow" */ '../declarative-flow/podcasts' ),

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

	wooexpress: () =>
		import(
			/* webpackChunkName: "trial-wooexpress-flow" */ '../declarative-flow/trial-wooexpress-flow'
		),

	free: () => import( /* webpackChunkName: "free-flow" */ '../declarative-flow/free' ),

	'with-theme-assembler': () =>
		import( /* webpackChunkName: "with-theme-assembler-flow" */ './with-theme-assembler-flow' ),

	'free-post-setup': () =>
		import( /* webpackChunkName: "free-post-setup-flow" */ '../declarative-flow/free-post-setup' ),

	'update-design': () =>
		import( /* webpackChunkName: "update-design-flow" */ '../declarative-flow/update-design' ),

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

	[ AGENCY_HOSTED_SITE_FLOW ]: () =>
		import( /* webpackChunkName: "agency-hosted-site-flow" */ './agency-hosted-site-flow' ),

	[ NEW_HOSTED_SITE_FLOW ]: () =>
		import( /* webpackChunkName: "new-hosted-site-flow" */ './new-hosted-site-flow' ),

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

	[ 'plugin-bundle' ]: () =>
		import( /* webpackChunkName: "plugin-bundle-flow" */ '../declarative-flow/plugin-bundle-flow' ),

	[ 'hundred-year-plan' ]: () =>
		import( /* webpackChunkName: "hundred-year-plan" */ './hundred-year-plan' ),

	'domain-user-transfer': () =>
		import( /* webpackChunkName: "domain-user-transfer-flow" */ './domain-user-transfer' ),
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

const aiAsseblerFlows: Record< string, () => Promise< { default: Flow } > > = config.isEnabled(
	'calypso/ai-assembler'
)
	? {
			[ AI_ASSEMBLER_FLOW ]: () =>
				import( /* webpackChunkName: "ai-assembler-flow" */ './ai-assembler' ),
	  }
	: {};

export default { ...availableFlows, ...videoPressTvFlows, ...aiAsseblerFlows };
