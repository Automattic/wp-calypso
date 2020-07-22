/**
 * External dependencies
 */
import React from 'react';

const Illustration = React.forwardRef( ( props, ref ) => {
	const { width = 200, height, path, alt, className, ...otherProps } = props;
	const src = require( 'assets/images/illustrations/' + path );

	if ( ! src ) {
		return;
	}

	return (
		<img
			src={ src.default }
			alt={ alt }
			className={ className }
			height={ height }
			width={ width }
			ref={ ref }
			{ ...otherProps }
		/>
	);
} );

export default React.memo( Illustration );
