/**
 * External dependencies
 */
import React from 'react';

/**
 * WordPress dependencies
 */
import { Tooltip } from '@wordpress/components';

const Example = () => (
	<Tooltip text="More information" position="top center">
		<div
			style={ {
				margin: '50px auto',
				width: '200px',
				padding: '20px',
				textAlign: 'center',
				border: '1px solid #ccc',
			} }
		>
			Hover for more information
		</div>
	</Tooltip>
);

export default Example;
