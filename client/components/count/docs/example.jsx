/**
 * External dependencies
 */

import React from 'react';
/**
 * Internal dependencies
 */
import Count from 'calypso/components/count';

const count = () => {
	/* Because Count is wrapped in Localize we have to store the example in a string */
};

count.defaultProps = {
	exampleCode:
		'<div>' +
		'\n\t<Count count={ 65365 } />' +
		'\n\t<Count primary count={ 65366 } />' +
		'\n</div>',
};

count.displayName = 'Count';

export default count;
