import config from '@automattic/calypso-config';
import type { FlowMetaData } from '../declarative-flow/internals/types';

const availableFlows: Array< FlowMetaData > = [
	{
		flowName: 'newsletter',
		downloadFlow: () => import( '../declarative-flow/newsletter' ),
	},
	{ flowName: 'import-focused', downloadFlow: () => import( '../declarative-flow/import-flow' ) },
	{ flowName: 'videopress', downloadFlow: () => import( '../declarative-flow/videopress' ) },
	{ flowName: 'link-in-bio', downloadFlow: () => import( '../declarative-flow/link-in-bio' ) },
	{ flowName: 'podcasts', downloadFlow: () => import( '../declarative-flow/podcasts' ) },
	{
		flowName: 'link-in-bio-post-setup',
		downloadFlow: () => import( '../declarative-flow/link-in-bio-post-setup' ),
	},
	{
		flowName: 'newsletter-post-setup',
		downloadFlow: () => import( '../declarative-flow/newsletter-post-setup' ),
	},
];

if ( config.isEnabled( 'themes/plugin-bundling' ) ) {
	availableFlows.push( {
		flowName: 'plugin-bundle',
		downloadFlow: () => import( '../declarative-flow/plugin-bundle-flow' ),
	} );
}
if ( config.isEnabled( 'signup/tailored-ecommerce' ) ) {
	availableFlows.push( {
		flowName: 'ecommerce',
		downloadFlow: () => import( '../declarative-flow/tailored-ecommerce-flow' ),
	} );
}

export default availableFlows;
