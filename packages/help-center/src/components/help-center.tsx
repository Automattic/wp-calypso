/* eslint-disable no-restricted-imports */
/**
 * External Dependencies
 */
import { useHasActiveSupport } from '@automattic/data-stores';
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
import { HELP_CENTER_STORE, SITE_STORE } from '../stores';
import { Container } from '../types';
import HelpCenterContainer from './help-center-container';

import '../styles.scss';

const HelpCenter: React.FC< Container > = ( { handleClose, hidden } ) => {
	const portalParent = useRef( document.createElement( 'div' ) ).current;
	const { setSite, setUnreadCount, setShowHelpCenter } = useDispatch( HELP_CENTER_STORE );
	const { show, isMinimized } = useSelect( ( select ) => ( {
		isMinimized: select( HELP_CENTER_STORE ).getIsMinimized(),
		show: select( HELP_CENTER_STORE ).isHelpCenterShown(),
	} ) );
	const { unreadCount, closeChat } = useHCWindowCommunicator( isMinimized || ! show );
	useEffect( () => {
		setUnreadCount( unreadCount );
	}, [ unreadCount, setUnreadCount ] );

	const { data: hasActiveSupport, isRefetching } = useHasActiveSupport( 'CHAT' );
	useEffect( () => {
		if ( hasActiveSupport && ! isRefetching ) {
			setShowHelpCenter( true );
		}
	}, [ hasActiveSupport, setShowHelpCenter, isRefetching ] );

	const siteId = useSelector( ( state ) => getSelectedSiteId( state ) );
	const primarySiteId = useSelector( ( state ) => getPrimarySiteId( state ) );
	const currentSite = window?.helpCenterData?.currentSite;
	const site = useSelect( ( select ) => select( SITE_STORE ).getSite( siteId || primarySiteId ) );

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
