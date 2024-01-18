import { clientRouter, makeLayout, render as clientRender } from 'calypso/controller/index.web';
import { featureFlagFirewall, playgroundContext } from 'calypso/playground/controller';

export default function ( router: typeof clientRouter ) {
	const siteProfilerMiddleware = [
		featureFlagFirewall,
		playgroundContext,
		makeLayout,
		clientRender,
	];

	router( '/playground', ...siteProfilerMiddleware );
}
