import { Callback, Context } from '@automattic/calypso-router';
import debug from 'debug';
import { useEffect, useState } from 'react';
import store from 'store';
import PageViewTracker from 'calypso/a8c-for-agencies/components/a4a-page-view-tracker';
import {
	A4A_SIGNUP_FINISH_LINK,
	A4A_SIGNUP_LINK,
} from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import { useSelector } from 'calypso/state';
import {
	getActiveAgency,
	hasFetchedAgency,
	isFetchingAgency,
} from 'calypso/state/a8c-for-agencies/agency/selectors';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { hideMasterbar } from 'calypso/state/ui/actions';
import AgencySignUp from './primary/agency-signup';
import AgencySignupFinish from './primary/agency-signup-finish';
import AgencySignupV2 from './signup-v2';
import AgencySignupWCAsia from './signup-v2/wc-asia';

// A simple wrapper to ensure the PageViewTracker is only rendered, and the event fired,
// after the agency has been fetched and we know if the user is an agency user or not.
// This is because if they're an agency they get redirected and never see the page.
const PageViewTrackerWrapper = ( { path }: { path: string } ) => {
	const userLoggedIn = useSelector( isUserLoggedIn );
	const agency = useSelector( getActiveAgency );
	const hasFetched = useSelector( hasFetchedAgency );
	const isFetching = useSelector( isFetchingAgency );
	const [ shouldRenderTracker, setShouldRenderTracker ] = useState( false );

	useEffect( () => {
		if ( ! userLoggedIn ) {
			// The majority of users aren't logged in, and we render the tracker.
			// userLoggedIn seems to be accurate in it's initial state.
			setShouldRenderTracker( true );
		} else if ( hasFetched && ! isFetching ) {
			// Use a tiny delay to ensure all state updates have propagated.
			// Since there's a delay between hasFetched being set to true and
			// agency being set when an agency exists.
			// The 0 timeout gets it to execute after the current call stack is cleared.
			const timer = setTimeout( () => {
				setShouldRenderTracker( ! agency );
			}, 0 );

			return () => clearTimeout( timer );
		}
	}, [ hasFetched, isFetching, agency, userLoggedIn ] );

	if ( ! shouldRenderTracker ) {
		return null;
	}

	return <PageViewTracker title="A4A Signup" path={ path } />;
};

export const signUpContext: Callback = ( context, next ) => {
	context.store.dispatch( hideMasterbar() );
	context.primary = (
		<>
			<PageViewTrackerWrapper path={ context.path } />
			<AgencySignUp />
		</>
	);
	next();
};

export const signupV2Context: Callback = ( context, next ) => {
	context.store.dispatch( hideMasterbar() );
	context.primary = (
		<>
			<PageViewTrackerWrapper path={ context.path } />
			<AgencySignupV2 />
		</>
	);
	next();
};

export const signupWCAsiaContext: Callback = ( context, next ) => {
	context.store.dispatch( hideMasterbar() );
	context.primary = (
		<>
			<PageViewTrackerWrapper path={ context.path } />
			<AgencySignupWCAsia />
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
