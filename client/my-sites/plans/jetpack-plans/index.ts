import config, { isEnabled } from '@automattic/calypso-config';
import page, { type Callback } from 'page';
import { makeLayout, render as clientRender } from 'calypso/controller/index.web';
import {
	jetpackBoostWelcome,
	jetpackFreeWelcome,
	jetpackSocialWelcome,
	offerJetpackComplete,
	productSelect,
} from './controller';

export default function ( rootUrl: string, ...rest: Callback[] ): void {
	const addBoostAndSocialRoutes = config.isEnabled( 'jetpack/pricing-add-boost-social' );

	page( `${ rootUrl }/jetpack-free/welcome`, jetpackFreeWelcome, makeLayout, clientRender );

	if ( addBoostAndSocialRoutes ) {
		page( `${ rootUrl }/jetpack-boost/welcome`, jetpackBoostWelcome, makeLayout, clientRender );
		page( `${ rootUrl }/jetpack-social/welcome`, jetpackSocialWelcome, makeLayout, clientRender );
	}

	// We provide access to the page only when Feature Flag is enabled
	if ( isEnabled( 'jetpack/offer-complete-after-activation' ) ) {
		// Offer jetpack complete after Jetpack plugin activation
		page(
			`${ rootUrl }/complete/:site?/:lang?`,
			...rest,
			offerJetpackComplete,
			makeLayout,
			clientRender
		);
	}

	page(
		`${ rootUrl }/:duration?/:site?`,
		...rest,
		productSelect( rootUrl ),
		makeLayout,
		clientRender
	);
}
