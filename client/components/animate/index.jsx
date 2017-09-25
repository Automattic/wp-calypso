/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';

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
