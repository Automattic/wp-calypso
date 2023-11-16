import { ColorPalette } from '@wordpress/components';
import { useState } from 'react';

const ColorPaletteExample = () => {
	const colors = [
		{ name: 'red', color: '#f00' },
		{ name: 'white', color: '#fff' },
		{ name: 'blue', color: '#00f' },
	];

	const [ color, setColor ] = useState( colors[ 0 ].color );

	return (
		<ColorPalette
			colors={ colors }
			value={ color }
			onChange={ ( maybeColor ) => maybeColor && setColor( maybeColor ) }
		/>
	);
};

export default ColorPaletteExample;
