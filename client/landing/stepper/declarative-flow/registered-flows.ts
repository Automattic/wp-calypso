import config from '@automattic/calypso-config';
import type { FlowMetaData } from '../declarative-flow/internals/types';

const availableFlows: Array< FlowMetaData > = [
	{
		flowName: 'newsletter',
		downloadFlow: () =>
			import( /* webpackChunkName: "newsletter-flow" */ '../declarative-flow/newsletter' ),
	},
	{
		flowName: 'import-focused',
		downloadFlow: () =>
			import( /* webpackChunkName: "import-flow" */ '../declarative-flow/import-flow' ),
	},
	{
		flowName: 'videopress',
		downloadFlow: () =>
			import( /* webpackChunkName: "videopress-flow" */ '../declarative-flow/videopress' ),
	},
	{
		flowName: 'link-in-bio',
		downloadFlow: () =>
			import( /* webpackChunkName: "link-in-bio-flow" */ '../declarative-flow/link-in-bio' ),
	},
	{
		flowName: 'podcasts',
		downloadFlow: () =>
			import( /* webpackChunkName: "podcasts-flow" */ '../declarative-flow/podcasts' ),
	},
	{
		flowName: 'link-in-bio-post-setup',
		downloadFlow: () =>
			import(
				/* webpackChunkName: "link-in-bio-post-setup-flow" */ '../declarative-flow/link-in-bio-post-setup'
			),
	},
	{
		flowName: 'newsletter-post-setup',
		downloadFlow: () =>
			import(
				/* webpackChunkName: "newsletter-post-setup-flow" */ '../declarative-flow/newsletter-post-setup'
			),
	},
];

if ( config.isEnabled( 'themes/plugin-bundling' ) ) {
	availableFlows.push( {
		flowName: 'plugin-bundle',
		downloadFlow: () =>
			import(
				/* webpackChunkName: "plugin-bundle-flow" */ '../declarative-flow/plugin-bundle-flow'
			),
	} );
}
if ( config.isEnabled( 'signup/tailored-ecommerce' ) ) {
	availableFlows.push( {
		flowName: 'ecommerce',
		downloadFlow: () =>
			import(
				/* webpackChunkName: "tailored-ecommerce-flow" */ '../declarative-flow/tailored-ecommerce-flow'
			),
	} );
}

export default availableFlows;
