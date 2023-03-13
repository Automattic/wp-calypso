/* eslint-disable no-restricted-imports */
/**
 * External Dependencies
 */
import { useSupportAvailability } from '@automattic/data-stores';
import { useHappychatAvailable } from '@automattic/happychat-connection';
import { useSelect, useDispatch } from '@wordpress/data';
import { createPortal, useEffect, useRef } from '@wordpress/element';
import { useSelector } from 'react-redux';
import getPrimarySiteId from 'calypso/state/selectors/get-primary-site-id';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
/**
 * Internal Dependencies
 */
import { useHCWindowCommunicator } from '../happychat-window-communicator';
import { useStillNeedHelpURL } from '../hooks/use-still-need-help-url';
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
	const { setUnreadCount } = useDispatch( HELP_CENTER_STORE );
	const { setSite } = useDispatch( HELP_CENTER_STORE );

	const { show, isMinimized } = useSelect(
		( select ) => ( {
			isMinimized: ( select( HELP_CENTER_STORE ) as HelpCenterSelect ).getIsMinimized(),
			show: ( select( HELP_CENTER_STORE ) as HelpCenterSelect ).isHelpCenterShown(),
		} ),
		[]
	);

	const { unreadCount, closeChat } = useHCWindowCommunicator( isMinimized || ! show );

	useEffect( () => {
		setUnreadCount( unreadCount );
	}, [ unreadCount, setUnreadCount ] );

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
			closeChat();
			handleClose();
		};
	}, [ portalParent ] );

	return createPortal(
		<HelpCenterContainer handleClose={ handleClose } hidden={ hidden } />,
		portalParent
	);
};

export default HelpCenter;
