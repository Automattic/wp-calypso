/* eslint-disable no-restricted-imports */
/**
 * External Dependencies
 */
import config from '@automattic/calypso-config';
import { useSupportAvailability } from '@automattic/data-stores';
import { useHappychatAvailable } from '@automattic/happychat-connection';
import { loadScript } from '@automattic/load-script';
import { useSelect, useDispatch } from '@wordpress/data';
import { createPortal, useEffect, useRef } from '@wordpress/element';
import { useSelector } from 'react-redux';
import getPrimarySiteId from 'calypso/state/selectors/get-primary-site-id';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
/**
 * Internal Dependencies
 */
import useMessagingAuth from '../hooks/use-messaging-auth';
import { useStillNeedHelpURL } from '../hooks/use-still-need-help-url';
import useZendeskConfig from '../hooks/use-zendesk-config';
import { HELP_CENTER_STORE, USER_STORE, SITE_STORE } from '../stores';
import { Container } from '../types';
import HelpCenterContainer from './help-center-container';
import type { HelpCenterSelect, SiteSelect, UserSelect } from '@automattic/data-stores';
import '../styles.scss';

const HelpCenter: React.FC< Container > = ( { handleClose, hidden } ) => {
	const portalParent = useRef( document.createElement( 'div' ) ).current;
	const { data: chatStatus } = useSupportAvailability( 'CHAT' );
	const { data } = useHappychatAvailable( Boolean( chatStatus?.is_user_eligible ) );
	const { setShowHelpCenter } = useDispatch( HELP_CENTER_STORE );
	const { setSite } = useDispatch( HELP_CENTER_STORE );
	const { setShowMessagingWidget } = useDispatch( HELP_CENTER_STORE );
	const { setThirdPartyCookiesAllowed } = useDispatch( HELP_CENTER_STORE );

	const { status: zendeskStatus } = useZendeskConfig();
	useEffect( () => {
		if ( zendeskStatus === 'success' ) {
			setThirdPartyCookiesAllowed( true );
		} else if ( zendeskStatus === 'error' ) {
			setThirdPartyCookiesAllowed( false );
		}
	}, [ setThirdPartyCookiesAllowed, zendeskStatus ] );

	useEffect( () => {
		const zendeskKey: string | false = config( 'zendesk_presales_chat_key' );
		if ( ! zendeskKey ) {
			return;
		}

		function setUpMessagingEventHandlers() {
			if ( typeof window.zE !== 'function' ) {
				return;
			}

			window.zE( 'messenger', 'hide' );

			window.zE( 'messenger:on', 'open', function () {
				setShowMessagingWidget( true );
			} );
			window.zE( 'messenger:on', 'close', function () {
				setShowMessagingWidget( false );
			} );
		}

		loadScript(
			'https://static.zdassets.com/ekr/snippet.js?key=' + encodeURIComponent( zendeskKey ),
			setUpMessagingEventHandlers,
			{ id: 'ze-snippet' }
		);
	}, [ setShowMessagingWidget ] );

	const { data: messagingAuth } = useMessagingAuth();
	useEffect( () => {
		const jwt = messagingAuth?.user.jwt;
		if ( typeof window.zE !== 'function' || ! jwt ) {
			return;
		}

		window.zE( 'messenger', 'loginUser', function ( callback ) {
			callback( jwt );
		} );
	}, [ messagingAuth ] );

	const { showMessagingLauncher, showMessagingWidget } = useSelect( ( select ) => {
		const helpCenterSelect: HelpCenterSelect = select( HELP_CENTER_STORE );
		return {
			showMessagingLauncher: helpCenterSelect.isMessagingLauncherShown(),
			showMessagingWidget: helpCenterSelect.isMessagingWidgetShown(),
		};
	}, [] );

	useEffect( () => {
		if ( typeof window.zE !== 'function' ) {
			return;
		}
		if ( showMessagingLauncher ) {
			window.zE( 'messenger', 'show' );
		} else {
			window.zE( 'messenger', 'hide' );
		}
	}, [ showMessagingLauncher ] );

	useEffect( () => {
		if ( typeof window.zE !== 'function' ) {
			return;
		}
		if ( showMessagingWidget ) {
			window.zE( 'messenger', 'open' );
		} else {
			window.zE( 'messenger', 'close' );
		}
	}, [ showMessagingWidget ] );

	useEffect( () => {
		if ( data?.status === 'assigned' ) {
			setShowHelpCenter( true );
		}
	}, [ data, setShowHelpCenter ] );

	const siteId = useSelector( ( state ) => getSelectedSiteId( state ) );
	const primarySiteId = useSelector( ( state ) => getPrimarySiteId( state ) );

	useSelect( ( select ) => ( select( USER_STORE ) as UserSelect ).getCurrentUser(), [] );

	const currentSite = window?.helpCenterData?.currentSite;
	const site = useSelect(
		( select ) => ( select( SITE_STORE ) as SiteSelect ).getSite( siteId || primarySiteId ),
		[ siteId || primarySiteId ]
	);

	setSite( currentSite ? currentSite : site );
	useSupportAvailability( 'CHAT' );

	useStillNeedHelpURL();

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
	}, [ portalParent ] );

	return createPortal(
		<HelpCenterContainer handleClose={ handleClose } hidden={ hidden } />,
		portalParent
	);
};

export default HelpCenter;
