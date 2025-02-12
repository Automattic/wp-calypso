import { HelpCenter, User as UserStore } from '@automattic/data-stores';
import { useDispatch } from '@wordpress/data';
import { useCallback } from 'react';
import AsyncLoad from 'calypso/components/async-load';

const HELP_CENTER_STORE = HelpCenter.register();

const AsyncHelpCenter: React.FC< { user: UserStore.CurrentUser | undefined } > = ( { user } ) => {
	const { setShowHelpCenter } = useDispatch( HELP_CENTER_STORE );

	const handleClose = useCallback( () => {
		setShowHelpCenter( false );
	}, [ setShowHelpCenter ] );

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
