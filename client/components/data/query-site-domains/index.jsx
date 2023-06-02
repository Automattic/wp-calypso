import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { fetchSiteDomains } from 'calypso/state/sites/domains/actions';
import { isRequestingSiteDomains } from 'calypso/state/sites/domains/selectors';

const request = ( siteId ) => ( dispatch, getState ) => {
	if ( siteId && ! isRequestingSiteDomains( getState(), siteId ) ) {
		dispatch( fetchSiteDomains( siteId ) );
	}
};

export default function QuerySiteDomains( { siteId } ) {
	const dispatch = useDispatch();

	useEffect( () => {
		dispatch( request( siteId ) );
	}, [ dispatch, siteId ] );

	return null;
}

QuerySiteDomains.propTypes = { siteId: PropTypes.number.isRequired };
