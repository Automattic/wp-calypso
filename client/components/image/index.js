import classnames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

const hideImageOnError = ( event ) => {
	event.target.style.display = 'none';
};

const Image = React.forwardRef( ( { alt, className, src, ...restProps }, ref ) => {
	return (
		<img
			ref={ ref }
			src={ src }
			onError={ hideImageOnError }
			className={ classnames( className, 'image' ) }
			alt={ alt }
			{ ...restProps }
		/>
	);
} );

Image.propTypes = {
	alt: PropTypes.string,
	className: PropTypes.string,
	src: PropTypes.string,
};

export default Image;
