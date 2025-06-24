import { createHigherOrderComponent } from '@wordpress/compose';
import { forwardRef, useContext, useMemo } from 'react';
import { useSubscription } from 'use-subscription';
import I18NContext from './context';

export function useRtl() {
	const i18n = useContext( I18NContext );
	// Subscription object (adapter) for the `useSubscription` hook
	const RtlSubscription = useMemo(
		() => ( {
			getCurrentValue() {
				return i18n.isRtl();
			},
			subscribe( callback ) {
				return i18n.subscribe( callback );
			},
		} ),
		[ i18n ]
	);

	return useSubscription( RtlSubscription );
}

export const withRtl = createHigherOrderComponent(
	( WrappedComponent ) =>
		forwardRef( function WrappedRtlComponent( props, ref ) {
			const isRtl = useRtl();
			return <WrappedComponent { ...props } isRtl={ isRtl } ref={ ref } />;
		} ),
	'WithRTL'
);
