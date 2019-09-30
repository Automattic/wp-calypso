/**
 * External dependencies
 */
import React, { forwardRef, useState, useEffect } from 'react';
import { createHigherOrderComponent } from '@wordpress/compose';
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { getLocaleSlug, isLocaleRtl } from 'lib/i18n-utils';

export function isCurrentLanguageRtl() {
	return isLocaleRtl( getLocaleSlug() );
}

export function useRtl() {
	const [ isRtl, setRtl ] = useState( isCurrentLanguageRtl );

	useEffect( () => {
		const onChange = () => setRtl( isCurrentLanguageRtl );
		i18n.on( 'change', onChange );
		return () => i18n.off( 'change', onChange );
	} );

	return isRtl;
}

export const withRtl = createHigherOrderComponent(
	WrappedComponent =>
		forwardRef( ( props, ref ) => {
			const isRtl = useRtl();
			return <WrappedComponent { ...props } isRtl={ isRtl } ref={ ref } />;
		} ),
	'WithRTL'
);
