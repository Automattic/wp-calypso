import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { waitFor } from 'calypso/my-sites/marketplace/util';
import { requestThemeOnAtomic } from 'calypso/state/themes/actions';
import { isRequestingTheme, isThemeRequestSuccessful } from 'calypso/state/themes/selectors';

interface QueryThemeAvailabilityForSiteProps {
	siteId: number;
	themeId: string;
	onThemeAvialable: CallableFunction;
}

const QueryThemeAvailabilityForSite = ( {
	siteId,
	themeId,
	onThemeAvialable,
}: QueryThemeAvailabilityForSiteProps ) => {
	const dispatch = useDispatch();
	const requestStarted = useSelector( ( state ) =>
		isRequestingTheme( state, siteId, themeId as any )
	);

	const requestSuccessful = useSelector( ( state ) =>
		isThemeRequestSuccessful( state, siteId, themeId as any )
	);

	useEffect( () => {
		if ( requestSuccessful ) {
			return onThemeAvialable();
		}
		if ( ! requestStarted ) {
			waitFor( 3 ).then( () => dispatch( requestThemeOnAtomic( themeId, siteId ) ) );
		}
	}, [ siteId, dispatch, requestStarted, requestSuccessful ] );

	return null;
};

export default QueryThemeAvailabilityForSite;
