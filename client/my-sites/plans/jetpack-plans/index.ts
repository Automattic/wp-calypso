import config from '@automattic/calypso-config';
import page from 'page';
import { makeLayout, render as clientRender } from 'calypso/controller/index.web';
import {
	jetpackBoostWelcome,
	jetpackFreeWelcome,
	jetpackSocialWelcome,
	productSelect,
} from './controller';

export default function ( rootUrl: string, ...rest: PageJS.Callback[] ): void {
	const addBoostAndSocialRouts = config.isEnabled( 'jetpack/pricing-add-boost-social' );

	page( `${ rootUrl }/jetpack-free/welcome`, jetpackFreeWelcome, makeLayout, clientRender );

	if ( addBoostAndSocialRouts ) {
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
