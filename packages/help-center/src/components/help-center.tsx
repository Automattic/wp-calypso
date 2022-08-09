/* eslint-disable no-restricted-imports */
/* eslint-disable no-console */
/**
 * External Dependencies
 */
import { recordTracksEvent } from '@automattic/calypso-analytics';
import { useSupportAvailability } from '@automattic/data-stores';
import { useSelect, useDispatch } from '@wordpress/data';
import { createPortal, useEffect, useRef } from '@wordpress/element';
import { useSelector } from 'react-redux';
import getIsSimpleSite from 'calypso/state/sites/selectors/is-simple-site';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
/**
 * Internal Dependencies
 */
import { execute } from '../directly';
import { useStillNeedHelpURL } from '../hooks/use-still-need-help-url';
import { HELP_CENTER_STORE, USER_STORE } from '../stores';
import { Container } from '../types';
import { SITE_STORE } from './help-center-contact-form';
import HelpCenterContainer from './help-center-container';

import '../styles.scss';

const HelpCenter: React.FC< Container > = ( { handleClose } ) => {
	const portalParent = useRef( document.createElement( 'div' ) ).current;

	const { siteId, isSimpleSite } = useSelector( ( state ) => {
		return {
			siteId: getSelectedSiteId( state ),
			isSimpleSite: getIsSimpleSite( state ),
		};
	} );

	// prefetch the current site and user
	useSelect( ( select ) => select( SITE_STORE ).getSite( siteId ) );
	useSelect( ( select ) => select( USER_STORE ).getCurrentUser() );
	const { setDirectlyData } = useDispatch( HELP_CENTER_STORE );
	useSupportAvailability( 'CHAT', isSimpleSite );
	const { data: supportData } = useSupportAvailability( 'OTHER', isSimpleSite );
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

	useEffect( () => {
		const classes = [ 'help-center' ];
		portalParent.classList.add( ...classes );

		portalParent.setAttribute( 'aria-modal', 'true' );
		portalParent.setAttribute( 'aria-labelledby', 'header-text' );

		document.body.appendChild( portalParent );
		const start = Date.now();

		return () => {
			recordTracksEvent( 'calypso_helpcenter_activity_time', {
				elapsed: ( Date.now() - start ) / 1000,
			} );
			document.body.removeChild( portalParent );
			handleClose();
		};
	}, [ portalParent ] );

	return createPortal( <HelpCenterContainer handleClose={ handleClose } />, portalParent );
};

export default HelpCenter;
