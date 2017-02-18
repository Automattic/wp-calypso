/**
 * Internal dependencies
 */
import userFactory from 'lib/user';
import {
	renderBrowseHappy,
	redirectToSignup,
	redirectToInvite
} from './controller';
import { makeLayout } from 'controller';
import { siteSelection } from 'my-sites/controller';

export default function( router ) {
	const user = userFactory();
	const isLoggedIn = !! user.get();

	if ( isLoggedIn ) {
		router( '/browsehappy/:site_id?',
			siteSelection,
			redirectToSignup,
			redirectToInvite,
			renderBrowseHappy,
			makeLayout
		);
	} else {
		router( '/browsehappy',
			redirectToSignup,
			redirectToInvite,
			renderBrowseHappy,
			makeLayout
		);
	}
}
