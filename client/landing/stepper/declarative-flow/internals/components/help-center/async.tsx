import { HelpCenter } from '@automattic/data-stores';
import { useDispatch } from '@wordpress/data';
import { useCallback } from 'react';
import AsyncLoad from 'calypso/components/async-load';
import { useSelector } from 'calypso/state';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import type { User as UserStore } from '@automattic/data-stores';

const HELP_CENTER_STORE = HelpCenter.register();

const AsyncHelpCenter: React.FC< { user: UserStore.CurrentUser | undefined } > = ( { user } ) => {
	const isLoggedIn = useSelector( isUserLoggedIn );

	const { setShowHelpCenter } = useDispatch( HELP_CENTER_STORE );

	const handleClose = useCallback( () => {
		setShowHelpCenter( false );
	}, [ setShowHelpCenter ] );

	// The Help Center only works if you're logged in. Don't waste time loading it if you're not.
	if ( ! isLoggedIn ) {
		return null;
	}

	/**
	 * The stepper query parameter ensures Webpack treats this Help Center as separate from the one in the main client app.
	 * Without it, Webpack would create one shared chunk, loaded in both apps. Since Stepper is smaller, more CSS would
	 * need be bundled into that shared chunk. This is great for Stepper, but it duplicates the CSS in the main client app.
	 * See: #97480
	 */
	return (
		<AsyncLoad
			require="@automattic/help-center?stepper"
			placeholder={ null }
			handleClose={ handleClose }
			currentUser={ user }
		/>
	);
};

export default AsyncHelpCenter;
