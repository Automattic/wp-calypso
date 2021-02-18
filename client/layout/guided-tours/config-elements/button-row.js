/**
 * External dependencies
 */

import React from 'react';

const ButtonRow = ( { children } ) => {
	const className =
		React.Children.count( children ) === 1
			? 'guided-tours__single-button-row'
			: 'guided-tours__choice-button-row';

	return <div className={ className }>{ children }</div>;
};

export default ButtonRow;
