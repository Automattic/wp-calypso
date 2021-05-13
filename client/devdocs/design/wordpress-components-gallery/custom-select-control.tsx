/**
 * External dependencies
 */
import React from 'react';

/**
 * WordPress dependencies
 */
import { CustomSelectControl } from '@wordpress/components';

const defaultOptions = [
	{
		key: 'small',
		name: 'Small',
		style: { fontSize: '50%' },
	},
	{
		key: 'normal',
		name: 'Normal',
		style: { fontSize: '100%' },
		className: 'can-apply-custom-class-to-option',
	},
	{
		key: 'large',
		name: 'Large',
		style: { fontSize: '200%' },
	},
	{
		key: 'huge',
		name: 'Huge',
		style: { fontSize: '300%' },
	},
];

const CustomSelectControlExample = () => (
	<CustomSelectControl label="Font size" options={ defaultOptions } />
);

export default CustomSelectControlExample;
