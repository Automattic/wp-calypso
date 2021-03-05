/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import TextareaAutosize from '../index';

TextareaAutosize.displayName = 'TextareaAutosize';
TextareaAutosizeExample.displayName = 'TextareaAutosize';

function TextareaAutosizeExample( props ) {
	return props.exampleCode;
}

TextareaAutosizeExample.defaultProps = {
	exampleCode: (
		<TextareaAutosize
			rows="1"
			defaultValue={
				'This textarea will grow and shrink to suit its content, ' +
				'though it keeps a minimum height.'
			}
		/>
	),
};

export default TextareaAutosizeExample;
