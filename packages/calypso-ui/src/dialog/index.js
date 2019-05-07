/**
 * External dependencies
 */
import * as React from 'react';

import './style.scss';

export default function Dialog( props ) {
	return (
		<>
			<h1>A Dialog</h1>
			{ props.children }
		</>
	);
}
