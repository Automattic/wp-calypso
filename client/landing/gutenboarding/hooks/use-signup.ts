/**
 * External dependencies
 */
import * as React from 'react';
import { useSelect, useDispatch } from '@wordpress/data';
import { useHistory } from 'react-router-dom';

/**
 * Internal dependencies
 */
import { STORE_KEY as ONBOARD_STORE } from '../stores/onboard';
import { USER_STORE } from '../stores/user';
import { useIsAnchorFm } from '../path';

/**
 * When a new user completes Gutenboarding, before creating a site we show signup dialog.
 * This hook that returns callback to navigate to previous and next steps in Gutenboarding flow
 *
 * @typedef { object } SignupDialog
 * @property { boolean } showSignupDialog use to open the Signup modal
 * @property { Function } onSignupDialogOpen call to open the modal
 * @property { Function } onSignupDialogClose call when closing the modal
 *
 * @returns { SignupDialog } An object to handle signup dialog rendering
 */

export default function useSignup() {
	const { showSignupDialog } = useSelect( ( select ) => select( ONBOARD_STORE ).getState() );
	const { setShowSignupDialog } = useDispatch( ONBOARD_STORE );
	const isAnchorFmSignup = useIsAnchorFm();
	const hasNewUser = useSelect( ( select ) => !! select( USER_STORE ).getNewUser() );
	const hasCurrentUser = useSelect( ( select ) => !! select( USER_STORE ).getCurrentUser() );

	const {
		location: { pathname, search },
	} = useHistory();

	React.useEffect( () => {
		// This handles opening the signup modal when there is a ?signup query parameter
		// The use case is a user clicking "Create account" from login
		// TODO: We can remove this condition when we've converted signup into it's own page
		// We also open the signup modal when this is an Anchor.fm signup and
		// we don't have a user yet.
		if (
			new URLSearchParams( search ).has( 'signup' ) ||
			( isAnchorFmSignup && ! hasNewUser && ! hasCurrentUser )
		) {
			setShowSignupDialog( true );
		} else {
			// Dialogs usually close naturally when the user clicks the browser's
			// back/forward buttons because their parent is unmounted. However
			// this header isn't unmounted on route changes so we need to
			// explicitly hide the dialog.
			setShowSignupDialog( false );
		}
	}, [ pathname, isAnchorFmSignup, hasNewUser, hasCurrentUser ] ); // eslint-disable-line react-hooks/exhaustive-deps

	return {
		showSignupDialog,
		onSignupDialogOpen: React.useCallback( () => setShowSignupDialog( true ), [] ),
		onSignupDialogClose: React.useCallback( () => setShowSignupDialog( false ), [] ),
	};
}
