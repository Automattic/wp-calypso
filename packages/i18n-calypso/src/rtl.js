import { createHigherOrderComponent } from '@wordpress/compose';
import { forwardRef, useCallback, useContext, useSyncExternalStore } from 'react';
import I18NContext from './context';

export function useRtl() {
	const i18n = useContext( I18NContext );

	const getSnapshot = useCallback( () => i18n.isRtl(), [ i18n ] );
	const subscribe = useCallback( ( callback ) => i18n.subscribe( callback ), [ i18n ] );

	return useSyncExternalStore( subscribe, getSnapshot, getSnapshot );
}

export const withRtl = createHigherOrderComponent(
	( WrappedComponent ) =>
		forwardRef( function WrappedRtlComponent( props, ref ) {
			const isRtl = useRtl();
			return <WrappedComponent { ...props } isRtl={ isRtl } ref={ ref } />;
		} ),
	'WithRTL'
);
