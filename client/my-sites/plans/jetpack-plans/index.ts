import { isEnabled } from '@automattic/calypso-config';
import page, { type Callback } from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller/index.web';
import {
	jetpackBoostWelcome,
	jetpackFreeWelcome,
	jetpackSocialWelcome,
	productSelect,
} from './controller';

export default function ( rootUrl: string, ...rest: Callback[] ): void {
	const addBoostAndSocialRoutes = isEnabled( 'jetpack/pricing-add-boost-social' );

	page( `${ rootUrl }/jetpack-free/welcome`, jetpackFreeWelcome, makeLayout, clientRender );

	if ( addBoostAndSocialRoutes ) {
		page( `${ rootUrl }/jetpack-boost/welcome`, jetpackBoostWelcome, makeLayout, clientRender );
		page( `${ rootUrl }/jetpack-social/welcome`, jetpackSocialWelcome, makeLayout, clientRender );
	}

	page(
		`${ rootUrl }/:duration?/:site?`,
		...rest,
		productSelect( rootUrl ),
		makeLayout,
		clientRender
	);
}
