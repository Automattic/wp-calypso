/* eslint-disable no-restricted-imports */
/**
 * External Dependencies
 */
import { useSelect, useDispatch } from '@wordpress/data';
import { createPortal, useEffect, useRef } from '@wordpress/element';
import { useSelector } from 'react-redux';
import getPrimarySiteId from 'calypso/state/selectors/get-primary-site-id';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
/**
 * Internal Dependencies
 */
import { useChatStatus, useZendeskMessaging, useStillNeedHelpURL } from '../hooks';
import { HELP_CENTER_STORE, USER_STORE, SITE_STORE } from '../stores';
import { Container } from '../types';
import HelpCenterContainer from './help-center-container';
import type { SiteSelect, UserSelect, HelpCenterSelect } from '@automattic/data-stores';
import '../styles.scss';

function useMessagingBindings( hasActiveChats: boolean, isMessagingScriptLoaded: boolean ) {
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

const HelpCenter: React.FC< Container > = ( { handleClose, hidden } ) => {
	const portalParent = useRef( document.createElement( 'div' ) ).current;
	const isHelpCenterShown = useSelect(
		( select ) => ( select( HELP_CENTER_STORE ) as HelpCenterSelect ).isHelpCenterShown(),
		[]
	);
	const { setSite } = useDispatch( HELP_CENTER_STORE );

	const siteId = useSelector( ( state ) => getSelectedSiteId( state ) );
	const primarySiteId = useSelector( ( state ) => getPrimarySiteId( state ) );

	useSelect( ( select ) => ( select( USER_STORE ) as UserSelect ).getCurrentUser(), [] );

	/**
	 * This site is provided by the backed in Editing Toolkit.
	 * It's difficult to get the site information on the client side in Atomic sites. So we moved this challenge to the backend,
	 * and forwarded the data using `localize_script` to the client side.
	 */
	const backendProvidedSite = window?.helpCenterData?.currentSite;

	const site = useSelect(
		( select ) => ( select( SITE_STORE ) as SiteSelect ).getSite( siteId || primarySiteId ),
		[ siteId || primarySiteId ]
	);

	const usedSite = backendProvidedSite || site;

	useEffect( () => {
		setSite( usedSite );
	}, [ usedSite, setSite ] );

	useStillNeedHelpURL();

	const { hasActiveChats, isEligibleForChat } = useChatStatus( 'wpcom_messaging', false );
	const { isMessagingScriptLoaded } = useZendeskMessaging(
		'zendesk_support_chat_key',
		( isHelpCenterShown && isEligibleForChat ) || hasActiveChats,
		isEligibleForChat && hasActiveChats
	);

	useMessagingBindings( hasActiveChats, isMessagingScriptLoaded );

	useEffect( () => {
		const classes = [ 'help-center' ];
		portalParent.classList.add( ...classes );

		portalParent.setAttribute( 'aria-modal', 'true' );
		portalParent.setAttribute( 'aria-labelledby', 'header-text' );

		document.body.appendChild( portalParent );

		return () => {
			document.body.removeChild( portalParent );
			handleClose();
		};
	}, [ portalParent, handleClose ] );

	return createPortal(
		<HelpCenterContainer handleClose={ handleClose } hidden={ hidden } />,
		portalParent
	);
};

export default HelpCenter;
