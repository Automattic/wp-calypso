/**
 * External dependencies
 */
import React, { useState } from 'react';

/**
 * WordPress dependencies
 */
import { ColorPalette } from '@wordpress/components';

const Example = () => {
	const colors: ColorPalette.Color[] = [
		{ name: 'red', color: '#f00' },
		{ name: 'white', color: '#fff' },
		{ name: 'blue', color: '#00f' },
	];

	const [ color, setColor ] = useState( colors[ 0 ] );

	return (
		<ColorPalette
			colors={ colors }
			value={ color }
			onChange={ ( maybeColor ) => maybeColor && setColor( maybeColor ) }
		/>
	);
};

export default Example;
