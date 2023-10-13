import debugFactory from 'debug';
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { requestAsyncToast } from 'calypso/state/async-toast/actions';
import isRequestingAsyncToast from 'calypso/state/selectors/is-requesting-async-toast';
import isStaleAsyncToast from 'calypso/state/selectors/is-stale-async-toast';
import { IAppState } from 'calypso/state/types';
import { SiteId } from 'calypso/types';

const debug = debugFactory( 'calypso:query-async-toast' );

interface QueryAsyncToastProps {
	siteId: SiteId;
}

export const useQueryAsyncToast = ( props: QueryAsyncToastProps ) => {
	const isRequesting = useSelector( ( state: IAppState ) => isRequestingAsyncToast( state ) );
	const isStale = useSelector( ( state: IAppState ) => isStaleAsyncToast( state ) );
	const reduxDispatch = useDispatch();
	const siteId = props.siteId;
	console.log( { dependencies: { siteId, isRequesting } } );
	useEffect( () => {
		console.log( 'USE EFFECT QUERY ASYNC TOAST' );
		debug( `siteId "${ siteId }" is fetching async toasts` );
		if ( ! siteId || isRequesting ) {
			return;
		}
		if ( isStale ) {
			requestAsyncToast( { siteId } )( reduxDispatch );
		}
	}, [ siteId, isRequesting, isStale, reduxDispatch ] );
};

export default function QueryAsyncToast( { siteId }: { siteId: SiteId } ) {
	useQueryAsyncToast( { siteId } );
	return null;
}
