import { BaseControl, TextareaControl } from '@wordpress/components';
import { useState } from 'react';

const BaseControlExample = () => {
	const [ content, setContent ] = useState( '' );
	return (
		<BaseControl id="textarea-1" label="Text" help="Enter some text">
			<TextareaControl value={ content } onChange={ setContent } />
		</BaseControl>
	);
};

export default BaseControlExample;
