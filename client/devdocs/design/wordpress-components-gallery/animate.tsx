import { Animate, Notice } from '@wordpress/components';
import React from 'react';

const AnimateExample = () => (
	<Animate type="loading">
		{ ( { className } ) => (
			<Notice className={ className } status="success">
				<p>Loading animation</p>
			</Notice>
		) }
	</Animate>
);

export default AnimateExample;
