/**
 * External dependencies
 */
import React, { PropTypes } from 'react';

const Animate = ( { type, children } ) => (
	<div className={ `animate__${ type }` }>
		{ children }
	</div>
);

Animate.propTypes = {
	type: PropTypes.oneOf( [
		'appear', 'fade-in'
	] )
};

export default Animate;
