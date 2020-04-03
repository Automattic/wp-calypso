/**
 * External dependencies
 *
 */
import React from 'react';
import { createHigherOrderComponent } from '@wordpress/compose';

/**
 * Internal dependencies
 */
import { SiteOffsetContext } from './context';

export const withApplySiteOffset = createHigherOrderComponent( Wrapped => {
	return function WithApplySiteOffset( props ) {
		return (
			<SiteOffsetContext.Consumer>
				{ applySiteOffset => <Wrapped { ...props } applySiteOffset={ applySiteOffset } /> }
			</SiteOffsetContext.Consumer>
		);
	};
}, 'WithApplySiteOffset' );

export const useApplySiteOffset = () => {
	return React.useContext( SiteOffsetContext );
};
