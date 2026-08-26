import config from '@automattic/calypso-config';
import { useSelect } from '@wordpress/data';
import { Suspense, lazy, useCallback, useEffect, useState } from 'react';
import { useAuth } from '../auth';
import { useHelpCenter } from '../help-center';
// eslint-disable-next-line no-restricted-imports
import type { HelpCenterSelect } from '@automattic/data-stores';

const HELP_CENTER_STORE = 'automattic/help-center';

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
	const isMinimized = useSelect(
		( select ) =>
			!! ( select( HELP_CENTER_STORE ) as HelpCenterSelect | undefined )?.getIsMinimized?.(),
		[ isShown ]
	);
	const [ displayMode, setDisplayMode ] = useState< 'sidebar' | 'floating' >( () =>
		window.localStorage.getItem( 'help-center-display-mode' ) === 'floating'
			? 'floating'
			: 'sidebar'
	);

	// The panel header's display-mode menu broadcasts switches via this event.
	useEffect( () => {
		const onModeChange = ( event: Event ) => {
			setDisplayMode( ( event as CustomEvent ).detail === 'floating' ? 'floating' : 'sidebar' );
		};
		window.addEventListener( 'help-center-display-mode', onModeChange );
		return () => {
			window.removeEventListener( 'help-center-display-mode', onModeChange );
		};
	}, [] );

	// Docked mode: the panel renders as a fixed right-hand column (like the site
	// editor's secondary panels) and this class pushes the dashboard body aside.
	// Minimizing falls back to the default bottom bar, so the push is released.
	useEffect( () => {
		const isDocked = isShown && ! isMinimized && displayMode === 'sidebar';
		document.documentElement.classList.toggle( 'has-docked-help-center', isDocked );
		return () => {
			document.documentElement.classList.remove( 'has-docked-help-center' );
		};
	}, [ isShown, isMinimized, displayMode ] );

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
