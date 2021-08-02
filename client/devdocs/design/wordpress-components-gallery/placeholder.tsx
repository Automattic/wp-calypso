import { Placeholder, Notice } from '@wordpress/components';
import { more } from '@wordpress/icons';
import React from 'react';

const PlaceholderExample = () => (
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

export default PlaceholderExample;
