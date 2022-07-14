import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { savePreference } from 'calypso/state/preferences/actions';
import { getSidebarIsCollapsed } from 'calypso/state/ui/selectors';

export const sidebarHOC = ( Component ) => {
	return ( props ) => {
		const reduxDispatch = useDispatch();
		const sidebarIsCollapsed = useSelector( getSidebarIsCollapsed );

		useEffect( () => {
			if ( sidebarIsCollapsed ) {
				reduxDispatch( recordTracksEvent( 'calypso_toggle_sidebar' ) );
				reduxDispatch( savePreference( 'sidebarCollapsed', ! sidebarIsCollapsed ) );
			}
		}, [] );

		return <Component { ...props } />;
	};
};
