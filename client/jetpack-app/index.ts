import page from '@automattic/calypso-router';
import { render as clientRender } from 'calypso/controller';
import { jetpackAppPlans, pageNotFound } from './controller';
import { makeJetpackAppLayout } from './page-middleware/layout';

export default function () {
	page( '/jetpack-app/plans', jetpackAppPlans, makeJetpackAppLayout, clientRender );

	// Default to /plans page until we have more pages
	page( '/jetpack-app', '/jetpack-app/plans' );

	// Show 404 page in all the other cases
	page( '/jetpack-app/*', pageNotFound, makeJetpackAppLayout, clientRender );
}
