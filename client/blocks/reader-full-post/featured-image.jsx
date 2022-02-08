import PropTypes from 'prop-types';

const hideImageOnError = ( event ) => {
	event.target.style.display = 'none';
};

export default function FeaturedImage( { src, alt } ) {
	return (
		<div className="reader-full-post__featured-image">
			<img src={ src } alt={ alt } onError={ hideImageOnError } />
		</div>
	);
}

FeaturedImage.propTypes = {
	src: PropTypes.string,
	alt: PropTypes.string,
};
