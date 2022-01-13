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
				i18n.on( 'change', callback );
				return () => i18n.off( 'change', callback );
			},
		} ),
		[ i18n ]
	);

	return useSubscription( RtlSubscription );
}

export const withRtl = createHigherOrderComponent(
	( WrappedComponent ) =>
		forwardRef( ( props, ref ) => {
			const isRtl = useRtl();
			return <WrappedComponent { ...props } isRtl={ isRtl } ref={ ref } />;
		} ),
	'WithRTL'
);
