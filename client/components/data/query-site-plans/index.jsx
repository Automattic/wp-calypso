import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { fetchSitePlans } from 'calypso/state/sites/plans/actions';
import { isRequestingSitePlans } from 'calypso/state/sites/plans/selectors';

const request = ( siteId ) => ( dispatch, getState ) => {
	if ( siteId && ! isRequestingSitePlans( getState(), siteId ) ) {
		dispatch( fetchSitePlans( siteId ) );
	}
};

export default function QuerySitePlans( { siteId } ) {
	const dispatch = useDispatch();

	useEffect( () => {
		dispatch( request( siteId ) );
	}, [ dispatch, siteId ] );

	return null;
}

QuerySitePlans.propTypes = {
	siteId: PropTypes.oneOfType( [ PropTypes.number, PropTypes.string ] ),
};
