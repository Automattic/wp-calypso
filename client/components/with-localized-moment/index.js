/**
 * External dependencies
 *
 * @format
 */

import React from 'react';
import { createHigherOrderComponent } from '@wordpress/compose';

/**
 * Internal dependencies
 */
import { MomentConsumer } from './context';

export default createHigherOrderComponent( Wrapped => {
	return function WithLocalizedMoment( props ) {
		return (
			<MomentConsumer>
				{ momentState => <Wrapped { ...props } moment={ momentState.moment } /> }
			</MomentConsumer>
		);
	};
}, 'WithLocalizedMoment' );
