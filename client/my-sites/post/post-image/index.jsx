/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import classnames from 'classnames';

/**
 * Style dependencies
 */
import './style.scss';

class PostImage extends React.PureComponent {
	static propTypes = {
		postImages: PropTypes.shape( {
			featured_image: PropTypes.string,
			canonical_image: PropTypes.shape( {
				uri: PropTypes.string.isRequired,
				width: PropTypes.number,
				height: PropTypes.number,
			} ),
			content_images: PropTypes.arrayOf(
				PropTypes.shape( {
					src: PropTypes.string.isRequired,
					width: PropTypes.number,
					height: PropTypes.number,
				} )
			),
			images: PropTypes.arrayOf(
				PropTypes.shape( {
					src: PropTypes.string.isRequired,
					width: PropTypes.number,
					height: PropTypes.number,
				} )
			),
		} ),
	};

	state = {
		collapsed: true,
	};

	render() {
		const imageURL = this._getImageURL();

		if ( ! imageURL ) {
			return null;
		}

		let containerStyles;
		if ( this.state.collapsed ) {
			containerStyles = {
				backgroundImage: 'url(' + imageURL + ')',
			};
		}

		const containerClasses = classnames( {
			'post-image': true,
			'is-collapsed': this.state.collapsed,
		} );

		return (
			/* eslint-disable jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events */
			<div className={ containerClasses } style={ containerStyles } onClick={ this._handleClick }>
				{ ! this.state.collapsed ? (
					<img src={ imageURL } alt="" className="post-image__image" />
				) : null }
			</div>
		);
	}

	_getImageURL = () => {
		const postImages = this.props.postImages;

		if ( postImages.featured_image !== '' ) {
			return postImages.featured_image;
		}

		if ( postImages.canonical_image && postImages.canonical_image.uri ) {
			return postImages.canonical_image.uri;
		}

		if (
			postImages.content_images &&
			postImages.content_images.length &&
			postImages.content_images[ 0 ].src
		) {
			return postImages.content_images[ 0 ].src;
		}

		if ( postImages.images && postImages.images.length ) {
			return postImages.images[ 0 ].src;
		}
	};

	_handleClick = () => {
		this.setState( {
			collapsed: ! this.state.collapsed,
		} );
	};
}

export default PostImage;
