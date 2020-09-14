/**
 * External dependencies
 */
import React from 'react';

/**
 * WordPress dependencies
 */
import { BaseControl } from '@wordpress/components';

const Example = () => (
	<BaseControl id="textarea-1" label="Text" help="Enter some text">
		<textarea id="textarea-1" />
	</BaseControl>
);

export default Example;
