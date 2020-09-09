/**
 * External dependencies
 */
import React from 'react';

/**
 * WordPress dependencies
 */
import {
	__experimentalRadio as Radio,
	__experimentalRadioGroup as RadioGroup,
} from '@wordpress/components';

const Example = () => (
	<RadioGroup id="default-radiogroup" accessibilityLabel="options">
		<Radio value="option1">Option 1</Radio>
		<Radio value="option2">Option 2</Radio>
	</RadioGroup>
);

export default Example;
