/** @format */

/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import TextareaAutosize from '../index';

function TextareaAutosizeExample() {
	return (
		<TextareaAutosize
			rows="1"
			defaultValue={
				'This textarea will grow and shrink to suit its content, ' +
				'though it keeps a minimum height.'
			}
		/>
	);
}

TextareaAutosizeExample.displayName = 'TextareaAutosize';

export default TextareaAutosizeExample;
