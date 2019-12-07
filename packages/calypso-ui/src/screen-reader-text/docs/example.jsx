/** @format */

/**
 * External dependencies
 */

import React from 'react';

/**
 * Internal dependencies
 */
import ScreenReaderText from 'components/screen-reader-text';

export default function ScreenReaderTextExample() {
	const srText = "I'm visible for screen readers";
	return (
		<div>
			<p>
				This text is followed by the JSX "&lt;ScreenReaderText&gt;
				{ srText }
				&lt;/ScreenReaderText&gt;". It is invisible on screen, but read out to screen readers.
				Inspect to see the example.
			</p>
			<ScreenReaderText>{ srText }</ScreenReaderText>
		</div>
	);
}
ScreenReaderTextExample.displayName = 'ScreenReaderTextExample';
