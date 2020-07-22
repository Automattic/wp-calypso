/**
 * External dependencies
 */
import React from 'react';

export const Illustration = ( {
	width = 200,
	height,
	path,
	alt = '',
	className,
	...otherProps
} ) => {
	const src = require( 'assets/images/illustrations/' + path );

	return (
		<img
			src={ src.default }
			alt={ alt }
			className={ className }
			height={ height }
			width={ width }
			{ ...otherProps }
		/>
	);
};

export default React.memo( Illustration );
