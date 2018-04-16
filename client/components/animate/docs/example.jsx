/** @format */

/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Animate from '../index';

function AnimateExample() {
	return (
		<Animate type="appear">
			This content will animate on rendering. You may have to reload the page to see the effect.
		</Animate>
	);
}

AnimateExample.displayName = 'Animate';

export default AnimateExample;
