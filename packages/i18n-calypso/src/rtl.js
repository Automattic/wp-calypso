import { createHigherOrderComponent } from '@wordpress/compose';
import { forwardRef } from 'react';
import { useSubscription } from 'use-subscription';

export default function rtlFactory( i18n ) {
	// Subscription object (adapter) for the `useSubscription` hook
	const RtlSubscription = {
		getCurrentValue() {
			return i18n.isRtl();
		},
		subscribe( callback ) {
			i18n.on( 'change', callback );
			return () => i18n.off( 'change', callback );
		},
	};

	function useRtl() {
		return useSubscription( RtlSubscription );
	}

	const withRtl = createHigherOrderComponent(
		( WrappedComponent ) =>
			forwardRef( ( props, ref ) => {
				const isRtl = useRtl();
				return <WrappedComponent { ...props } isRtl={ isRtl } ref={ ref } />;
			} ),
		'WithRTL'
	);

	return { useRtl, withRtl };
}
