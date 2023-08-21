import debugFactory from 'debug';
import PropTypes from 'prop-types';
import { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchSitePurchases } from 'calypso/state/purchases/actions';
import { isFetchingSitePurchases } from 'calypso/state/purchases/selectors';

const debug = debugFactory( 'calypso:query-site-purchases' );

export const useQuerySitePurchases = ( siteId, skipSiteCheck = false ) => {
	const isRequesting = useSelector( ( state ) => isFetchingSitePurchases( state ) );
	const reduxDispatch = useDispatch();
	const previousSiteId = useRef();

	useEffect( () => {
		if ( ! skipSiteCheck && ( ! siteId || isRequesting ) ) {
			return;
		}
		if ( ! skipSiteCheck && siteId === previousSiteId.current ) {
			return;
		}
		debug(
			`siteId "${ siteId }" has changed from previous "${ previousSiteId.current }"; fetching site purchases`
		);
		previousSiteId.current = siteId;

		reduxDispatch( fetchSitePurchases( siteId ) );
	}, [ siteId, skipSiteCheck, reduxDispatch, isRequesting ] );
};

export default function QuerySitePurchases( { siteId, skipSiteCheck } ) {
	useQuerySitePurchases( siteId, skipSiteCheck );
	return null;
}

QuerySitePurchases.propTypes = {
	siteId: PropTypes.number,
	skipSiteCheck: PropTypes.bool,
};
