import { useEffect } from 'react';
import { useDispatch } from 'calypso/state';
import { fetchJetpackSitesFeatures } from 'calypso/state/sites/features/actions';
import isRequestingJetpackSitesFeatures from 'calypso/state/sites/selectors/is-requesting-jetpack-sites-features';

const requestFeatures = () => ( dispatch: any, getState: any ) => {
	if ( ! isRequestingJetpackSitesFeatures( getState() ) ) {
		dispatch( fetchJetpackSitesFeatures() );
	}
};

/**
 * Makes an API request to fetch all features on all Jetpack sites for the current user.
 * This is the same data as QuerySiteFeatures, but this retrieves it for all Jetpack sites in
 * a single request whereas QuerySiteFeatures would have to make one request per site.
 */
export default function QueryJetpackSitesFeatures() {
	const dispatch = useDispatch();

	useEffect( () => {
		dispatch( requestFeatures() );
	}, [ dispatch ] );

	return null;
}
