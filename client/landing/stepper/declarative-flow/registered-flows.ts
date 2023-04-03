import { LINK_IN_BIO_DOMAIN_FLOW } from '@automattic/onboarding';
import type { Flow } from '../declarative-flow/internals/types';

const availableFlows: Record< string, () => Promise< { default: Flow } > > = {
	'site-setup': () =>
		import( /* webpackChunkName: "site-setup-flow" */ '../declarative-flow/site-setup-flow' ),

	'anchor-fm-flow': () =>
		import( /* webpackChunkName: "anchor-fm-flow" */ '../declarative-flow/anchor-fm-flow' ),

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
};

availableFlows[ 'plugin-bundle' ] = () =>
	import( /* webpackChunkName: "plugin-bundle-flow" */ '../declarative-flow/plugin-bundle-flow' );

export default availableFlows;
