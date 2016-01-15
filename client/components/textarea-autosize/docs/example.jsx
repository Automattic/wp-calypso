/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import TextareaAutosize from 'components/textarea-autosize';

const TextareaAutosizeExample = React.createClass( {
	render() {
		return (
			<div className="design-assets__group">
				<h2>TextareaAutosize</h2>
				<TextareaAutosize>Bananas</TextareaAutosize>
			</div>
		);
	}
} );

export default TextareaAutosizeExample;