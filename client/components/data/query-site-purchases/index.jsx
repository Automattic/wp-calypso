/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useRef } from 'react';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import { isFetchingSitePurchases } from 'calypso/state/purchases/selectors';
import { fetchSitePurchases } from 'calypso/state/purchases/actions';

const debug = debugFactory( 'calypso:query-site-purchases' );

export default function QuerySitePurchases( { siteId } ) {
	const isRequesting = useSelector( ( state ) => isFetchingSitePurchases( state ) );
	const reduxDispatch = useDispatch();
	const previousSiteId = useRef();

	useEffect( () => {
		if ( ! siteId || isRequesting ) {
			return;
		}
		if ( siteId === previousSiteId.current ) {
			return;
		}
		debug(
			`siteId "${ siteId }" has changed from previous "${ previousSiteId.current }"; fetching site purchases`
		);
		previousSiteId.current = siteId;

		reduxDispatch( fetchSitePurchases( siteId ) );
	}, [ siteId, reduxDispatch, isRequesting ] );

	return null;
}

QuerySitePurchases.propTypes = {
	siteId: PropTypes.number,
};
