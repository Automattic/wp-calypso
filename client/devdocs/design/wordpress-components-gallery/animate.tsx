/**
 * External dependencies
 */
import React from 'react';

/**
 * WordPress dependencies
 */
import { Animate, Notice } from '@wordpress/components';

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
