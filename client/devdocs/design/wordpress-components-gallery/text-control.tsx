import { TextControl } from '@wordpress/components';
import { useState } from 'react';

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
