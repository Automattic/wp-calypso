import isShallowEqual from '@wordpress/is-shallow-equal';
import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useMemoCompare } from 'calypso/lib/use-memo-compare';
import { requestSiteTerms } from 'calypso/state/terms/actions';
import { isRequestingTermsForQuery } from 'calypso/state/terms/selectors';

const request = ( siteId, taxonomy, query ) => ( dispatch, getState ) => {
	if ( siteId && ! isRequestingTermsForQuery( getState(), siteId, taxonomy, query ) ) {
		dispatch( requestSiteTerms( siteId, taxonomy, query ) );
	}
};

function QueryTerms( { siteId, taxonomy, query = {} } ) {
	const dispatch = useDispatch();
	const memoizedQuery = useMemoCompare( query, isShallowEqual );

	useEffect( () => {
		dispatch( request( siteId, taxonomy, memoizedQuery ) );
	}, [ dispatch, siteId, taxonomy, memoizedQuery ] );

	return null;
}

QueryTerms.propTypes = {
	siteId: PropTypes.number.isRequired,
	taxonomy: PropTypes.string.isRequired,
	query: PropTypes.object,
};

export default QueryTerms;
