/**
 * External dependencies
 */
import React from 'react';

const Illustration = ( { illustration } ) => (
	<div className="illustration-container">
		<img src={ '/calypso/images/illustrations/illustration-' + illustration + '.svg' } />
	</div>
);

export default Illustration;
