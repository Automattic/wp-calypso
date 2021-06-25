/**
 * External dependencies
 */
import React from 'react';

/**
 * WordPress dependencies
 */
import { BaseControl, TextareaControl } from '@wordpress/components';

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};

const BaseControlExample = () => (
	<BaseControl id="textarea-1" label="Text" help="Enter some text">
		<TextareaControl onChange={ noop } />
	</BaseControl>
);

export default BaseControlExample;
