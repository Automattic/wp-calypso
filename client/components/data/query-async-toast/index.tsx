import debugFactory from 'debug';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { requestAsyncToast } from 'calypso/state/async-toast/actions';
import getAsyncToastLastFetch from 'calypso/state/selectors/get-async-toast-last-fetch';
import isRequestingAsyncToast from 'calypso/state/selectors/is-requesting-async-toast';
import isStaleAsyncToast from 'calypso/state/selectors/is-stale-async-toast';
import { SiteId } from 'calypso/types';

const debug = debugFactory( 'calypso:async-toast' );

export type QueryAsyncToastProps = {
	siteId: SiteId | null;
};

export const QueryAsyncToast: React.FunctionComponent< QueryAsyncToastProps > = ( { siteId } ) => {
	const dispatch = useDispatch();

	const isRequesting = useSelector( isRequestingAsyncToast );
	const isStale = useSelector( isStaleAsyncToast );
	const lastFetch = useSelector( getAsyncToastLastFetch );
	const now = Date.now();

	useEffect( () => {
		const maxAge = 5 * 1000;
		if ( siteId === null ) {
			debug( 'siteId is null; do not request' );
			return;
		}
		if ( isRequesting ) {
			debug( 'isRequesting is truthy; do not request' );
			return;
		}
		if ( ! isStale && now - lastFetch <= maxAge ) {
			debug( 'isStale is false and lastFetch is too recent; do not fetch' );
			return;
		}
		debug( 'dispatch requestAsyncToast' );
		dispatch( requestAsyncToast( siteId ) );
	}, [ dispatch, isStale, isRequesting, lastFetch, now, siteId ] );

	return null;
};
