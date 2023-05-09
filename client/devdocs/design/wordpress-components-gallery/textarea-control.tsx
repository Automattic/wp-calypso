import { TextareaControl } from '@wordpress/components';
import { useState } from 'react';

const TextareaControlExample = () => {
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

export default TextareaControlExample;
