/* eslint-disable no-restricted-imports */
/**
 * External Dependencies
 */
import config from '@automattic/calypso-config';
import { loadScript } from '@automattic/load-script';
import { useSelect, useDispatch } from '@wordpress/data';
import { createPortal, useEffect, useRef } from '@wordpress/element';
import { useSelector } from 'react-redux';
import getPrimarySiteId from 'calypso/state/selectors/get-primary-site-id';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
/**
 * Internal Dependencies
 */
import { useChat, useStillNeedHelpURL } from '../hooks';
import { HELP_CENTER_STORE, USER_STORE, SITE_STORE } from '../stores';
import { Container } from '../types';
import HelpCenterContainer from './help-center-container';
import type { SiteSelect, UserSelect, HelpCenterSelect } from '@automattic/data-stores';
import '../styles.scss';

const ZENDESK_SCRIPT_ID = 'ze-snippet';

function useMessagingWidget( hasActiveChats: boolean, isEligibleForChat: boolean ) {
	const { setMessagingScriptLoaded, setShowMessagingLauncher, setShowMessagingWidget } =
		useDispatch( HELP_CENTER_STORE );
	const { isMessagingScriptLoaded, showMessagingLauncher, showMessagingWidget } = useSelect(
		( select ) => {
			const helpCenterSelect: HelpCenterSelect = select( HELP_CENTER_STORE );
			return {
				isMessagingScriptLoaded: helpCenterSelect.isMessagingScriptLoaded(),
				showMessagingLauncher: helpCenterSelect.isMessagingLauncherShown(),
				showMessagingWidget: helpCenterSelect.isMessagingWidgetShown(),
			};
		},
		[]
	);

	const zendeskKey: string = config( 'zendesk_support_chat_key' );
	useEffect( () => {
		if ( ! isEligibleForChat ) {
			return;
		}

		if ( document.getElementById( ZENDESK_SCRIPT_ID ) ) {
			return;
		}

		function setUpMessagingEventHandlers( retryCount = 0 ) {
			if ( typeof window.zE !== 'function' ) {
				if ( retryCount < 5 ) {
					setTimeout( setUpMessagingEventHandlers, 250, ++retryCount );
				}
				return;
			}

			setMessagingScriptLoaded( true );

			window.zE( 'messenger', 'hide' );

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
		}

		loadScript(
			'https://static.zdassets.com/ekr/snippet.js?key=' + encodeURIComponent( zendeskKey ),
			setUpMessagingEventHandlers,
			{ id: ZENDESK_SCRIPT_ID }
		);
	}, [
		setMessagingScriptLoaded,
		setShowMessagingLauncher,
		setShowMessagingWidget,
		isEligibleForChat,
		zendeskKey,
	] );

	useEffect( () => {
		if ( typeof window.zE !== 'function' || ! isMessagingScriptLoaded ) {
			return;
		}

		window.zE( 'messenger', showMessagingLauncher ? 'show' : 'hide' );
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
	const { setSite } = useDispatch( HELP_CENTER_STORE );

	const siteId = useSelector( ( state ) => getSelectedSiteId( state ) );
	const primarySiteId = useSelector( ( state ) => getPrimarySiteId( state ) );

	useSelect( ( select ) => ( select( USER_STORE ) as UserSelect ).getCurrentUser(), [] );

	const currentSite = window?.helpCenterData?.currentSite;
	const site = useSelect(
		( select ) => ( select( SITE_STORE ) as SiteSelect ).getSite( siteId || primarySiteId ),
		[ siteId || primarySiteId ]
	);

	setSite( currentSite ? currentSite : site );

	useStillNeedHelpURL();
	const { hasActiveChats, isEligibleForChat } = useChat( false, true );
	useMessagingWidget( hasActiveChats, isEligibleForChat );

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
