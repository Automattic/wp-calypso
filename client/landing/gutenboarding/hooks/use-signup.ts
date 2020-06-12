/**
 * External dependencies
 */
import * as React from 'react';
import { useHistory } from 'react-router-dom';

/**
 * Internal dependencies
 */
import { usePath, useCurrentStep, Step } from '../path';

/**
 * The use case is a user clicking "Create account" from login
 **/

export default function useSignup() {
	const [ showSignupDialog, setShowSignupDialog ] = React.useState( false );

	const currentStep = useCurrentStep();
	const makePath = usePath();
	const {
		location: { pathname, search },
		push,
	} = useHistory();

	React.useEffect( () => {
		// This handles opening the signup modal when there is a ?signup query parameter
		// then removes the parameter.
		// The use case is a user clicking "Create account" from login
		// TODO: We can remove this condition when we've converted signup into it's own page
		if ( ! showSignupDialog && new URLSearchParams( search ).has( 'signup' ) ) {
			setShowSignupDialog( true );
			push( makePath( Step[ currentStep ] ) );
		} else {
			// Dialogs usually close naturally when the user clicks the browser's
			// back/forward buttons because their parent is unmounted. However
			// this header isn't unmounted on route changes so we need to
			// explicitly hide the dialog.
			setShowSignupDialog( false );
		}
	}, [ pathname, setShowSignupDialog ] ); // eslint-disable-line react-hooks/exhaustive-deps

	return {
		showSignupDialog,
		onSignupDialogClose: React.useCallback( () => setShowSignupDialog( false ), [] ),
	};
}
