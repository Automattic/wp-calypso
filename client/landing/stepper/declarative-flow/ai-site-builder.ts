import { dispatch, useSelect } from '@wordpress/data';
import { useEffect } from 'react';
import { STEPS, PRIVATE_STEPS } from './internals/steps';
import {
	AssertConditionResult,
	AssertConditionState,
	Flow,
	ProvidedDependencies,
} from './internals/types';
import { USER_STORE } from '../stores';
import type { UserSelect } from '@automattic/data-stores';
import wpcom from 'calypso/lib/wp';
import { AccountCreateReturn } from 'calypso/lib/signup/api/type';
import {
	reloadProxy,
	requestAllBlogsAccess,
	wpcomRequest,
} from '@automattic/data-stores/src/wpcom-request-controls';
import config from '@automattic/calypso-config';
import { createSite } from '../hooks/use-create-site-hook';
import { fetchCurrentUser } from 'calypso/state/current-user/actions';
import { remoteLoginUser } from 'calypso/state/login/actions/remote-login-user';
export const AI_SITE_BUILDER_FLOW = 'ai-site-builder';

const aiSiteBuilder: Flow = {
	name: AI_SITE_BUILDER_FLOW,
	isSignupFlow: true,
	__experimentalUseBuiltinAuth: true,

	useSteps() {
		const userIsLoggedIn = useSelect(
			( select ) => ( select( USER_STORE ) as UserSelect ).isCurrentUserLoggedIn(),
			[]
		);

		return userIsLoggedIn ? [ STEPS.PROCESSING ] : [ PRIVATE_STEPS.USER, STEPS.PROCESSING ];
	},

	useStepNavigation( currentStep, navigate ) {
		const userIsLoggedIn = useSelect(
			( select ) => ( select( USER_STORE ) as UserSelect ).isCurrentUserLoggedIn(),
			[]
		);

		async function submit( providedDependencies: ProvidedDependencies = {} ) {
			switch ( currentStep ) {
				case 'user':
					// The user step will handle loading the token in its useEffect
					// We just need to navigate to the next step
					return navigate( 'processing' );

				case 'processing':
					// Wait for the user to be logged in and token to be loaded
					await new Promise( ( resolve ) => {
						const checkAuth = () => {
							if ( wpcom.token || userIsLoggedIn ) {
								resolve( true );
							} else {
								setTimeout( checkAuth, 100 );
							}
						};
						checkAuth();
					} );

					// Get the user
					const user = await wpcom.req.get( '/me' );

					// Create a new site using the user's username
					const newSite = await wpcom.req.post( '/sites/new', {
						blog_name: user.username,
						blog_title: 'My New Website',
						lang_id: 1,
						client_id: config( 'wpcom_signup_id' ),
						client_secret: config( 'wpcom_signup_key' ),
					} );

				// No idea how to log in a user if they use passwordless signup
				// Not sure how to attach a site to a user
				// I just want to redirect to the new site's admin dashboard with them logged in
				default:
					return;
			}
		}

		return { submit };
	},

	useAssertConditions(): AssertConditionResult {
		return { state: AssertConditionState.SUCCESS };
	},
};

export default aiSiteBuilder;
