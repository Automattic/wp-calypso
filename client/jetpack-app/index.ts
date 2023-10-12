import page from 'page';
import { render as clientRender } from 'calypso/controller';
import { jetpackAppPlans, redirectIfNotJetpackApp } from './controller';
import { makeJetpackAppLayout } from './page-middleware/layout';

export default function () {
	page(
		'/jetpack-app/plans',
		redirectIfNotJetpackApp,
		jetpackAppPlans,
		makeJetpackAppLayout,
		clientRender
	);

	// Default to /plans page until we have more pages
	page( '/jetpack-app', '/jetpack-app/plans' );
}
