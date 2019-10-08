/**
 * External dependencies
 */
import React, { forwardRef } from 'react';
import { useSubscription } from 'use-subscription';
import { createHigherOrderComponent } from '@wordpress/compose';
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { getLocaleSlug, isLocaleRtl } from 'lib/i18n-utils';

// Subscription object (adapter) for the `useSubscription` hook
const RtlSubscription = {
	getCurrentValue() {
		return isLocaleRtl( getLocaleSlug() );
	},
	subscribe( callback ) {
		i18n.on( 'change', callback );
		return () => i18n.off( 'change', callback );
	},
};

export function useRtl() {
	return useSubscription( RtlSubscription );
}

export const withRtl = createHigherOrderComponent(
	WrappedComponent =>
		forwardRef( ( props, ref ) => {
			const isRtl = useRtl();
			return <WrappedComponent { ...props } isRtl={ isRtl } ref={ ref } />;
		} ),
	'WithRTL'
);
