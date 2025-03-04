import debugFactory from 'debug';
import PropTypes from 'prop-types';
import { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchSitePurchases } from 'calypso/state/purchases/actions';
import { isFetchingSitePurchases } from 'calypso/state/purchases/selectors';

const debug = debugFactory( 'calypso:query-site-purchases' );

export const useQuerySitePurchases = ( siteId ) => {
	const isRequesting = useSelector( isFetchingSitePurchases );
	const reduxDispatch = useDispatch();
	const previousSiteId = useRef();

	useEffect( () => {
		if ( ! siteId || isRequesting ) {
			return;
		}
		if ( siteId === previousSiteId.current ) {
			return;
		}

		// No need to request /rest/v1.1/sites/-1/purchases.
		const siteIdNumber = Number( siteId );
		if ( ! isNaN( siteIdNumber ) && siteIdNumber < 0 ) {
			return;
		}

		debug(
			`siteId "${ siteId }" has changed from previous "${ previousSiteId.current }"; fetching site purchases`
		);
		previousSiteId.current = siteId;

		reduxDispatch( fetchSitePurchases( siteId ) );
	}, [ siteId, reduxDispatch, isRequesting ] );
};

export default function QuerySitePurchases( { siteId } ) {
	useQuerySitePurchases( siteId );
	return null;
}

QuerySitePurchases.propTypes = {
	siteId: PropTypes.number,
};
