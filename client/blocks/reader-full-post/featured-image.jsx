/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';

export default class FeaturedImage extends React.Component {
	constructor( props ) {
		super();
		this.state = { src: props.src, alt: props.alt };
		this.handleImageError = () => {
			this.setState( { src: '', alt: '' } );
		};
	}

	UNSAFE_componentWillReceiveProps( nextProps ) {
		if ( nextProps.src !== this.props.src ) {
			this.setState( { src: nextProps.src } );
		}
		if ( nextProps.alt !== this.props.alt ) {
			this.setState( { alt: nextProps.alt } );
		}
	}

	render() {
		if ( ! this.state.src ) {
			return null;
		}

		return (
			<div className="reader-full-post__featured-image">
				<img src={ this.state.src } onError={ this.handleImageError } alt={ this.state.alt } />
			</div>
		);
	}
}

FeaturedImage.propTypes = {
	src: PropTypes.string,
	alt: PropTypes.string,
};
