/**
 * External Dependencies
 */
import { useSupportAvailability } from '@automattic/data-stores';
import { useHappychatAvailable } from '@automattic/happychat-connection';
import { useSelect, useDispatch } from '@wordpress/data';
import { createPortal, useEffect, useRef } from '@wordpress/element';
/**
 * Internal Dependencies
 */
import { execute } from '../directly';
import { useStillNeedHelpURL } from '../hooks/use-still-need-help-url';
import { STORE_KEY, USER_KEY } from '../store';
import { Container } from '../types';
import { SITE_STORE } from './help-center-contact-form';
import HelpCenterContainer from './help-center-container';

import '../styles.scss';

const HelpCenter: React.FC< Container > = ( { handleClose } ) => {
	const portalParent = useRef( document.createElement( 'div' ) ).current;

	// prefetch the current site and user
	const site = useSelect( ( select ) => select( SITE_STORE ).getSite( window._currentSiteId ) );
	const user = useSelect( ( select ) => select( USER_KEY ).getCurrentUser() );
	const { setDirectlyData } = useDispatch( STORE_KEY );
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

	const isLoading = [
		! site,
		! user,
		isSupportDataLoading,
		isLoadingChat,
		isLoadingChatAvailable,
	].some( Boolean );

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
