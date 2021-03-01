/**
 * External dependencies
 */
import React from 'react';
import { noop } from 'lodash';

/**
 * WordPress dependencies
 */
import { BaseControl, TextareaControl } from '@wordpress/components';

const BaseControlExample = () => (
	<BaseControl id="textarea-1" label="Text" help="Enter some text">
		<TextareaControl onChange={ noop } />
	</BaseControl>
);

export default BaseControlExample;
