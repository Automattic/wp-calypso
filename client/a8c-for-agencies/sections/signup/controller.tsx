import { Callback, Context } from '@automattic/calypso-router';
import debug from 'debug';
import store from 'store';
import PageViewTracker from 'calypso/a8c-for-agencies/components/a4a-page-view-tracker';
import {
	A4A_SIGNUP_FINISH_LINK,
	A4A_SIGNUP_LINK,
} from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import { hideMasterbar } from 'calypso/state/ui/actions';
import AgencySignUp from './primary/agency-signup';
import AgencySignupFinish from './primary/agency-signup-finish';

export const signUpContext: Callback = ( context, next ) => {
	context.store.dispatch( hideMasterbar() );
	context.primary = (
		<>
			<PageViewTracker title="A4A Signup" path={ context.path } />
			<AgencySignUp />
		</>
	);
	next();
};

export const finishSignUpContext: Callback = ( context, next ) => {
	context.store.dispatch( hideMasterbar() );
	context.primary = <AgencySignupFinish />;
	next();
};

type OverriddenPageContext = Context & { hash?: Record< string, string > };

export const tokenRedirect: Callback = ( ctx, next ) => {
	const context = ctx as OverriddenPageContext;
	// We didn't get an auth token; take a step back
	// and ask for authorization from the user again
	if ( context.hash?.error ) {
		document.location.replace( A4A_SIGNUP_LINK );
		return next();
	}

	if ( context.hash?.access_token ) {
		debug( 'setting user token' );
		store.set( 'wpcom_token', context.hash.access_token );
	}

	if ( context.hash?.expires_in ) {
		debug( 'setting user token_expires_in' );
		store.set( 'wpcom_token_expires_in', context.hash.expires_in );
	}

	document.location.replace( A4A_SIGNUP_FINISH_LINK );
};
