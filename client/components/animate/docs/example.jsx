/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Animate from '../index';

function AnimateExample( props ) {
	return props.exampleCode;
}

Animate.displayName = 'Animate';
AnimateExample.displayName = 'Animate';

AnimateExample.defaultProps = {
	exampleCode: (
		<Animate type="appear">
			This content will animate on rendering. You may have to reload the page to see the effect.
		</Animate>
	),
};

export default AnimateExample;
