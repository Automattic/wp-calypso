/**
 * External dependencies
 */

import React from 'react';

export default function Complementary( { className, children } ) {
	return (
		<div className={ className } role="complementary">
			{ children }
		</div>
	);
}
