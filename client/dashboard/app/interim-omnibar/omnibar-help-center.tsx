import config from '@automattic/calypso-config';
import { Suspense, lazy, useCallback } from 'react';
import { useAuth } from '../auth';
import { useHelpCenter } from '../help-center';

const AsyncHelpCenterApp = lazy( () => import( '../help-center/help-center-app' ) );

/**
 * Renders the floating Help Center panel when the omnibar is enabled.
 * The masterbar's help button handles toggling via the shared help center store.
 */
export default function OmnibarHelpCenter() {
	const { user } = useAuth();
	const { isShown, setShowHelpCenter } = useHelpCenter();

	const handleClose = useCallback( () => {
		setShowHelpCenter( false, undefined, true );
	}, [ setShowHelpCenter ] );

	if ( ! isShown ) {
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
