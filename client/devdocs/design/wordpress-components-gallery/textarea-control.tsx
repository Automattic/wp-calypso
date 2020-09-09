/**
 * External dependencies
 */
import React, { useState } from 'react';

/**
 * WordPress dependencies
 */
import { TextareaControl } from '@wordpress/components';

const Example = () => {
	const [ value, setValue ] = useState( '' );

	return (
		<TextareaControl
			label="Hidable Label Text"
			help="Help text for the textarea"
			rows={ 4 }
			value={ value }
			onChange={ setValue }
		/>
	);
};

export default Example;
