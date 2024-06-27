import { useSelect, useDispatch } from '@wordpress/data';
import { useEffect } from '@wordpress/element';
import type { HelpCenterSelect } from '@automattic/data-stores';

export function useZendeskMessagingBindings(
	HELP_CENTER_STORE: string,
	hasActiveChats: boolean,
	isMessagingScriptLoaded: boolean
) {
	const { setShowMessagingLauncher, setShowMessagingWidget } = useDispatch( HELP_CENTER_STORE );
	const { showMessagingLauncher, showMessagingWidget } = useSelect( ( select ) => {
		const helpCenterSelect: HelpCenterSelect = select( HELP_CENTER_STORE );
		return {
			showMessagingLauncher: helpCenterSelect.isMessagingLauncherShown(),
			showMessagingWidget: helpCenterSelect.isMessagingWidgetShown(),
		};
	}, [] );

	useEffect( () => {
		if ( typeof window.zE !== 'function' || ! isMessagingScriptLoaded ) {
			return;
		}

		window.zE( 'messenger:on', 'open', function () {
			setShowMessagingWidget( true );
		} );
		window.zE( 'messenger:on', 'close', function () {
			setShowMessagingWidget( false );
		} );
		window.zE( 'messenger:on', 'unreadMessages', function ( count ) {
			if ( Number( count ) > 0 ) {
				setShowMessagingLauncher( true );
			}
		} );
	}, [ isMessagingScriptLoaded, setShowMessagingLauncher, setShowMessagingWidget ] );

	useEffect( () => {
		if ( typeof window.zE !== 'function' || ! isMessagingScriptLoaded ) {
			return;
		}
		// `showMessagingLauncher` starts off as undefined. This check means don't touch the widget if we're in default state.
		if ( typeof showMessagingLauncher === 'boolean' ) {
			window.zE( 'messenger', showMessagingLauncher ? 'show' : 'hide' );
		}
	}, [ showMessagingLauncher, isMessagingScriptLoaded ] );

	useEffect( () => {
		if ( typeof window.zE !== 'function' || ! isMessagingScriptLoaded ) {
			return;
		}

		window.zE( 'messenger', showMessagingWidget ? 'open' : 'close' );
	}, [ showMessagingWidget, isMessagingScriptLoaded ] );

	useEffect( () => {
		if ( hasActiveChats ) {
			setShowMessagingLauncher( true );
		}
	}, [ setShowMessagingLauncher, hasActiveChats ] );
}
