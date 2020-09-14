/**
 * External dependencies
 */
import React, { useState } from 'react';

/**
 * WordPress dependencies
 */
import { TextControl } from '@wordpress/components';

const TextControlExample = () => {
	const [ value, setValue ] = useState( '' );

	return (
		<TextControl
			label="Hidable Label Text"
			help="Help text to explain the input"
			type="text"
			value={ value }
			onChange={ setValue }
		/>
	);
};

export default TextControlExample;
