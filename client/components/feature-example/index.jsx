/**
 * External dependencies
 */
import React from 'react';

const FeatureExample = ( { children } ) => {
	return (
		<div className="feature-example">
			<div className="feature-example__content">
				{ children }
			</div>
			<div className="feature-example__gradient"></div>
		</div>
	);
};

FeatureExample.displayName = 'FeatureExample';
export default FeatureExample;
