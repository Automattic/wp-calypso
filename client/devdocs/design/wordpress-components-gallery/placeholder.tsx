/**
 * External dependencies
 */
import React from 'react';

/**
 * WordPress dependencies
 */
import { Placeholder, Notice } from '@wordpress/components';
import { more } from '@wordpress/icons';

const Example = () => (
	<Placeholder
		icon={ more }
		label="Placeholder example"
		instructions="Behold... a placeholder!"
		notices={
			<>
				<Notice>Notice A</Notice>
			</>
		}
		preview="A preview of my favorite block example"
	/>
);

export default Example;
