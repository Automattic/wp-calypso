import config from '@automattic/calypso-config';
import type { Flow } from '../declarative-flow/internals/types';

const availableFlows: Record< string, () => Promise< { default: Flow } > > = {
	'site-setup': () =>
		import( /* webpackChunkName: "site-setup-flow" */ '../declarative-flow/site-setup-flow' ),

	'anchor-fm-flow': () =>
		import( /* webpackChunkName: "anchor-fm-flow" */ '../declarative-flow/anchor-fm-flow' ),

	newsletter: () =>
		import( /* webpackChunkName: "newsletter-flow" */ '../declarative-flow/newsletter' ),

	'import-focused': () =>
		import( /* webpackChunkName: "import-flow" */ '../declarative-flow/import-flow' ),

	videopress: () =>
		import( /* webpackChunkName: "videopress-flow" */ '../declarative-flow/videopress' ),

	'link-in-bio': () =>
		import( /* webpackChunkName: "link-in-bio-flow" */ '../declarative-flow/link-in-bio' ),

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

	'free-post-setup': () =>
		import( /* webpackChunkName: "free-post-setup-flow" */ '../declarative-flow/free-post-setup' ),

	build: () => import( /* webpackChunkName: "build-flow" */ '../declarative-flow/build' ),
};

availableFlows[ 'plugin-bundle' ] = () =>
	import( /* webpackChunkName: "plugin-bundle-flow" */ '../declarative-flow/plugin-bundle-flow' );

if ( config.isEnabled( 'sites/copy-site' ) ) {
	availableFlows[ 'copy-site' ] = () =>
		import( /* webpackChunkName: "copy-site" */ '../declarative-flow/copy-site' );
}

export default availableFlows;
