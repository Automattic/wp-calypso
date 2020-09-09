/**
 * External dependencies
 */
import React, { useState } from 'react';

/**
 * WordPress dependencies
 */
import { __experimentalBoxControl as BoxControl } from '@wordpress/components';

const { __Visualizer: Visualizer } = BoxControl;

const Example = () => {
	const [ values, setValues ] = useState( {
		top: '50px',
		left: '10%',
		right: '10%',
		bottom: '50px',
	} );

	return (
		<>
			<BoxControl values={ values } onChange={ setValues } />
			<Visualizer values={ values } />
		</>
	);
};

export default Example;
