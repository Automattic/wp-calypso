import { createHigherOrderComponent } from '@wordpress/compose';
import debugFactory from 'debug';
import { useEffect, ComponentType } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { QueryAsyncToast } from 'calypso/components/data/query-async-toast';
import { deleteAsyncToast } from 'calypso/state/async-toast/actions';
import { AsyncToastKey, AsyncToastSeverity } from 'calypso/state/async-toast/types';
import {
	successNotice,
	infoNotice,
	warningNotice,
	errorNotice,
} from 'calypso/state/notices/actions';
import getAsyncToast from 'calypso/state/selectors/get-async-toast';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

const debug = debugFactory( 'calypso:async-toast' );

export type WithAsyncToast< P > = ( param: {
	toastKeys: AsyncToastKey[];
} ) => ( WrappedComponent: ComponentType< P > ) => ComponentType< P >;

export const withAsyncToast = ( { toastKeys }: { toastKeys: AsyncToastKey[] } ) => {
	return createHigherOrderComponent(
		< OuterProps, >( WrappedComponent: ComponentType< OuterProps > ) =>
			( props ) => {
				const dispatch = useDispatch();

				const siteId = useSelector( getSelectedSiteId );
				const allToasts = useSelector( getAsyncToast );
				const allToastsStringified = JSON.stringify( Array.from( allToasts.entries() ) );

				useEffect( () => {
					if ( siteId === null ) {
						debug( 'siteId is null' );
						return;
					}
					const siteToasts = allToasts.get( siteId );
					if ( siteToasts === undefined ) {
						debug( 'siteToasts is undefined' );
						return;
					}
					toastKeys
						.map( ( key: AsyncToastKey ) => {
							const toast = siteToasts.get( key ) ?? null;
							return {
								key,
								toast,
							};
						} )
						.filter( ( mapResult ) => {
							return mapResult.toast !== null;
						} )
						.map( ( { key, toast } ) => {
							if ( toast === null || toast.message === undefined ) {
								return;
							}
							switch ( toast.severity ) {
								case AsyncToastSeverity.Success:
									dispatch( successNotice( toast.message ) );
									break;
								case AsyncToastSeverity.Info:
									dispatch( infoNotice( toast.message ) );
									break;
								case AsyncToastSeverity.Warning:
									dispatch( warningNotice( toast.message ) );
									break;
								case AsyncToastSeverity.Error:
									dispatch( errorNotice( toast.message ) );
									break;
								default:
									debug( 'Unknown severity:', toast.severity );
									return;
							}
							dispatch( deleteAsyncToast( siteId, key ) );
						} );
				}, [ dispatch, siteId, allToasts, allToastsStringified ] );

				return (
					<>
						<QueryAsyncToast siteId={ siteId } />
						<WrappedComponent { ...props } />
					</>
				);
			},
		'withAsyncToast'
	);
};
