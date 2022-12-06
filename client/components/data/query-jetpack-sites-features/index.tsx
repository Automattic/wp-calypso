import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { fetchJetpackSitesFeatures } from 'calypso/state/sites/features/actions';
import isRequestingJetpackSitesFeatures from 'calypso/state/sites/selectors/is-requesting-jetpack-sites-features';

const requestFeatures = () => ( dispatch: any, getState: any ) => {
	if ( ! isRequestingJetpackSitesFeatures( getState() ) ) {
		dispatch( fetchJetpackSitesFeatures() );
	}
};

export default function QueryJetpackSitesFeatures() {
	const dispatch = useDispatch();

	useEffect( () => {
		dispatch( requestFeatures() );
	}, [ dispatch ] );

	return null;
}
