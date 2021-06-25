/**
 * External dependencies
 */
import React from 'react';

/**
 * WordPress dependencies
 */
import { Disabled, SelectControl, TextControl, TextareaControl } from '@wordpress/components';

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};

const DisabledExample = () => {
	return (
		<Disabled>
			<TextControl label="Text Control" value="" onChange={ noop } />
			<TextareaControl label="TextArea Control" value="" onChange={ noop } />
			<SelectControl
				label="Select Control"
				onChange={ noop }
				options={ [
					{ value: '', label: 'Select an option' },
					{ value: 'a', label: 'Option A' },
					{ value: 'b', label: 'Option B' },
					{ value: 'c', label: 'Option C' },
				] }
			/>
		</Disabled>
	);
};

export default DisabledExample;
