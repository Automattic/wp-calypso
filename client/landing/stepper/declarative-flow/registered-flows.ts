import config from '@automattic/calypso-config';
import type { Flow } from '../declarative-flow/internals/types';

const availableFlows: Record< string, () => Promise< { default: Flow } > > = {
	'site-setup-flow': () =>
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

	podcasts: () => import( /* webpackChunkName: "podcasts-flow" */ '../declarative-flow/podcasts' ),

	'link-in-bio-post-setup': () =>
		import(
			/* webpackChunkName: "link-in-bio-post-setup-flow" */ '../declarative-flow/link-in-bio-post-setup'
		),

	'newsletter-post-setup': () =>
		import(
			/* webpackChunkName: "newsletter-post-setup-flow" */ '../declarative-flow/newsletter-post-setup'
		),
};

if ( config.isEnabled( 'themes/plugin-bundling' ) ) {
	availableFlows[ 'plugin-bundle' ] = () =>
		import( /* webpackChunkName: "plugin-bundle-flow" */ '../declarative-flow/plugin-bundle-flow' );
}
if ( config.isEnabled( 'signup/tailored-ecommerce' ) ) {
	availableFlows[ 'ecommerce' ] = () =>
		import(
			/* webpackChunkName: "tailored-ecommerce-flow" */ '../declarative-flow/tailored-ecommerce-flow'
		);
}

export default availableFlows;
