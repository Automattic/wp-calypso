import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import isRequestingSiteFeatures from 'calypso/state/selectors/is-requesting-site-features';
import { fetchSiteFeatures } from 'calypso/state/sites/features/actions';

const request = ( siteId ) => ( dispatch, getState ) => {
	if ( siteId && ! isRequestingSiteFeatures( getState(), siteId ) ) {
		dispatch( fetchSiteFeatures( siteId ) );
	}
};

export default function QuerySiteFeatures( { siteId } ) {
	const dispatch = useDispatch();

	useEffect( () => {
		dispatch( request( siteId ) );
	}, [ dispatch, siteId ] );

	return null;
}

QuerySiteFeatures.propTypes = { siteId: PropTypes.number };
