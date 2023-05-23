/* eslint-disable no-restricted-imports */
/**
 * External Dependencies
 */
import config from '@automattic/calypso-config';
import { useSupportAvailability, useSupportActivity } from '@automattic/data-stores';
import { loadScript } from '@automattic/load-script';
import { useSelect, useDispatch } from '@wordpress/data';
import { createPortal, useEffect, useRef, useState } from '@wordpress/element';
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

const ZENDESK_SCRIPT_ID = 'ze-snippet';

const HelpCenter: React.FC< Container > = ( { handleClose, hidden } ) => {
	const portalParent = useRef( document.createElement( 'div' ) ).current;
	const { data: chatStatus } = useSupportAvailability( 'CHAT' );
	const { setSite } = useDispatch( HELP_CENTER_STORE );
	const { setShowMessagingLauncher } = useDispatch( HELP_CENTER_STORE );
	const { setShowMessagingWidget } = useDispatch( HELP_CENTER_STORE );
	const [ isMessagingScriptLoaded, setMessagingScriptLoaded ] = useState( false );

	const zendeskKey: string = config( 'zendesk_support_chat_key' );
	useEffect( () => {
		if ( ! chatStatus?.is_user_eligible ) {
			return;
		}

		if ( document.getElementById( ZENDESK_SCRIPT_ID ) ) {
			return;
		}

		function setUpMessagingEventHandlers() {
			setMessagingScriptLoaded( true );
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
	}, [ setShowMessagingLauncher, setShowMessagingWidget, chatStatus, zendeskKey ] );

	const { data: supportActivity } = useSupportActivity( Boolean( chatStatus?.is_user_eligible ) );
	const hasActiveChats = supportActivity?.some( ( ticket ) => ticket.channel === 'Messaging' );
	const { data: messagingAuth } = useMessagingAuth(
		zendeskKey,
		Boolean( chatStatus?.is_user_eligible ) && Boolean( hasActiveChats )
	);
	useEffect( () => {
		const jwt = messagingAuth?.user.jwt;
		if ( typeof window.zE !== 'function' || ! jwt || ! isMessagingScriptLoaded ) {
			return;
		}

		window.zE( 'messenger', 'loginUser', function ( callback ) {
			callback( jwt );
		} );
	}, [ messagingAuth, isMessagingScriptLoaded ] );

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
		if ( showMessagingLauncher ) {
			window.zE( 'messenger', 'show' );
		} else {
			window.zE( 'messenger', 'hide' );
		}
	}, [ showMessagingLauncher, isMessagingScriptLoaded ] );

	useEffect( () => {
		if ( typeof window.zE !== 'function' || ! isMessagingScriptLoaded ) {
			return;
		}
		if ( showMessagingWidget ) {
			window.zE( 'messenger', 'open' );
		} else {
			window.zE( 'messenger', 'close' );
		}
	}, [ showMessagingWidget, isMessagingScriptLoaded ] );

	useEffect( () => {
		if ( hasActiveChats ) {
			setShowMessagingLauncher( true );
		}
	}, [ setShowMessagingLauncher, hasActiveChats ] );

	useZendeskConfig( Boolean( chatStatus?.is_user_eligible ) ); // Pre-fetch

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
