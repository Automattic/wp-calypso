import config from '@automattic/calypso-config';
import { Suspense, lazy, useCallback, useState } from 'react';
import { useAuth } from '../auth';
import { useHelpCenter } from '../help-center';

const AsyncHelpCenterApp = lazy( () => import( '../help-center/help-center-app' ) );

/**
 * The `help-center` query param is acted on by `useActionHooks` inside the
 * `HelpCenter` component itself, so the panel has to be mounted for a deep link
 * to open it. Mount on load whenever the param is present, and leave it to
 * `useActionHooks` to decide which values it recognizes.
 */
function hasHelpCenterQueryParam() {
	return new URLSearchParams( window.location.search ).has( 'help-center' );
}

/**
 * Renders the floating Help Center panel when the omnibar is enabled.
 * The masterbar's help button handles toggling via the shared help center store.
 *
 * Once the panel has been opened for the first time, the inner `HelpCenter`
 * component is kept mounted and manages its own visibility via the help center
 * store. Unmounting it on close would tear down the Zendesk Smooch iframe
 * mid-request and surface errors in the console.
 */
export default function OmnibarHelpCenter() {
	const { user } = useAuth();
	const { isShown, setShowHelpCenter } = useHelpCenter();
	const [ shouldMount, setShouldMount ] = useState( hasHelpCenterQueryParam );

	const handleClose = useCallback( () => {
		setShowHelpCenter( false, undefined, true );
	}, [ setShowHelpCenter ] );

	// Latch to true the first time the panel is shown. React will re-render
	// immediately and discard this render's output.
	if ( isShown && ! shouldMount ) {
		setShouldMount( true );
	}

	// Defer the lazy chunk download until the panel is opened or deep-linked to.
	if ( ! shouldMount ) {
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
