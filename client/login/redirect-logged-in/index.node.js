import { isConfirmSubscriptionRedirect } from './confirm-subscription';

export default function redirectLoggedIn( { isLoggedIn, query, res }, next ) {
	if ( isLoggedIn && ! isConfirmSubscriptionRedirect( query?.redirect_to ) ) {
		res.redirect( '/home' );
		return;
	}

	next();
}
