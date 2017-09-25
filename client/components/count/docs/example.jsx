/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Count from 'components/count';

const count = () => (
	<div>
		<Count count={ 65365 } />
		<Count primary count={ 65366 } />
	</div>
)

count.displayName = 'Count';

export default count;
