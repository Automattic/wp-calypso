import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { requestSiteKeyrings } from 'calypso/state/site-keyrings/actions';
import { isRequestingSiteKeyrings } from 'calypso/state/site-keyrings/selectors';

const request = ( siteId ) => ( dispatch, getState ) => {
	if ( siteId && ! isRequestingSiteKeyrings( getState(), siteId ) ) {
		dispatch( requestSiteKeyrings( siteId ) );
	}
};

function QuerySiteKeyrings( { siteId } ) {
	const dispatch = useDispatch();
	useEffect( () => {
		dispatch( request( siteId ) );
	}, [ siteId ] );
	return null;
}

QuerySiteKeyrings.propTypes = {
	siteId: PropTypes.number,
};

export default QuerySiteKeyrings;
