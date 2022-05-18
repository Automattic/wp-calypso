import classnames from 'classnames';
import PropTypes from 'prop-types';

const hideImageOnError = ( event ) => {
	event.target.style.display = 'none';
};

export default function Image( { alt, className, src, ...restProps } ) {
	return (
		<img
			src={ src }
			onError={ hideImageOnError }
			className={ classnames( className, 'image' ) }
			alt={ alt }
			{ ...restProps }
		/>
	);
}

Image.propTypes = {
	alt: PropTypes.string,
	className: PropTypes.string,
	src: PropTypes.string,
};
