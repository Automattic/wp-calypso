import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { requestSite } from 'calypso/state/reader/sites/actions';
import { shouldSiteBeFetched } from 'calypso/state/reader/sites/selectors';

function QueryReaderSite( { siteId } ) {
	const dispatch = useDispatch();
	const shouldFetch = useSelector( ( state ) => shouldSiteBeFetched( state, siteId ) );

	useEffect( () => {
		if ( siteId && shouldFetch ) {
			dispatch( requestSite( siteId ) );
		}
	}, [ dispatch, siteId, shouldFetch ] );

	return null;
}

QueryReaderSite.propTypes = {
	siteId: PropTypes.number,
};

export default QueryReaderSite;
