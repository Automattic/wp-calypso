import config from '@automattic/calypso-config';
import { Suspense, lazy, useCallback, useRef } from 'react';
import { useAuth } from '../auth';
import { useHelpCenter } from '../help-center';

const AsyncHelpCenterApp = lazy( () => import( '../help-center/help-center-app' ) );

/**
 * Renders the floating Help Center panel when the omnibar is enabled.
 * The masterbar's help button handles toggling via the shared help center store.
 *
 * Once the panel has been opened for the first time, the inner `HelpCenter`
 * component is kept mounted and manages its own visibility via the help center
 * store. Unmounting it on close would tear down the Zendesk Smooch iframe
 * mid-request and surface "TypeError: Failed to fetch" in the console
 * (see DOTMSD-1197).
 */
export default function OmnibarHelpCenter() {
	const { user } = useAuth();
	const { isShown, setShowHelpCenter } = useHelpCenter();
	const hasBeenShownRef = useRef( false );

	const handleClose = useCallback( () => {
		setShowHelpCenter( false, undefined, true );
	}, [ setShowHelpCenter ] );

	if ( isShown ) {
		hasBeenShownRef.current = true;
	}

	// Defer the lazy chunk download until the first time the panel is opened.
	if ( ! hasBeenShownRef.current ) {
		return null;
	}

	return (
		<Suspense fallback={ null }>
			<AsyncHelpCenterApp
				currentUser={ user }
				handleClose={ handleClose }
				locale={ user.language }
				onboardingUrl={ config( 'wpcom_signup_url' ) }
				sectionName="dashboard"
			/>
		</Suspense>
	);
}
