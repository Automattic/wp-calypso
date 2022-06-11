/* eslint-disable no-restricted-imports */
/**
 * External Dependencies
 */
import { useSupportAvailability } from '@automattic/data-stores';
import { useHappychatAvailable } from '@automattic/happychat-connection';
import { useSelect, useDispatch } from '@wordpress/data';
import { createPortal, useEffect, useRef } from '@wordpress/element';
import { useSelector } from 'react-redux';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
/**
 * Internal Dependencies
 */
import { execute } from '../directly';
import { useStillNeedHelpURL } from '../hooks/use-still-need-help-url';
import { HELP_CENTER_STORE } from '../stores';
import { Container } from '../types';
import { SITE_STORE } from './help-center-contact-form';
import HelpCenterContainer from './help-center-container';

import '../styles.scss';

const HelpCenter: React.FC< Container > = ( { handleClose } ) => {
	const portalParent = useRef( document.createElement( 'div' ) ).current;

	const siteId = useSelector( getSelectedSiteId );

	// prefetch the current site
	const site = useSelect( ( select ) => select( SITE_STORE ).getSite( siteId ), [ siteId ] );
	const { setDirectlyData } = useDispatch( HELP_CENTER_STORE );
	const { isLoading: isLoadingChat } = useSupportAvailability( 'CHAT' );
	const { isLoading: isLoadingChatAvailable } = useHappychatAvailable();
	const { data: supportData, isLoading: isSupportDataLoading } = useSupportAvailability( 'OTHER' );
	useStillNeedHelpURL();

	useEffect( () => {
		if ( supportData?.is_user_eligible_for_directly ) {
			execute( [
				'onReady',
				( { session } ) => {
					setDirectlyData( { isLoaded: true, hasSession: session } );
				},
			] );
		}
	}, [ supportData, setDirectlyData ] );

	console.log( 'omar', [ ! site, isSupportDataLoading, isLoadingChat, isLoadingChatAvailable ] );

	const isLoading = [ ! site, isSupportDataLoading, isLoadingChat, isLoadingChatAvailable ].some(
		Boolean
	);

	useEffect( () => {
		const classes = [ 'help-center' ];
		portalParent.classList.add( ...classes );

		document.body.appendChild( portalParent );

		return () => {
			document.body.removeChild( portalParent );
		};
	}, [ portalParent ] );

	return createPortal(
		<HelpCenterContainer handleClose={ handleClose } isLoading={ isLoading } />,
		portalParent
	);
};

export default HelpCenter;
