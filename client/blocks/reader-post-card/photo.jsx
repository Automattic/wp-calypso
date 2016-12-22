/**
 * External Dependencies
 */
import React from 'react';
import { noop } from 'lodash';
import classnames from 'classnames';

/**
 * Internal Dependencies
 */
import cssSafeUrl from 'lib/css-safe-url';

class PostPhoto extends React.Component {

	state = {
		isExpanded: false
	};

	handleClick = ( event ) => {
		if ( this.state.isExpanded ) {
			return;
		}

		// If the photo's not expanded, don't open full post yet
		event.preventDefault();
		this.setState( { isExpanded: true } );
	}

	// might need to put into state to respond to resizes + debounce
	getViewportHeight() {
		return Math.max( document.documentElement.clientHeight, window.innerHeight || 0 );
	}

	// getAspectRatio() {
	// 	return this.props.imageWidth / this.props.imageHeight;
	// }

	render() {
		const { imageUri, href, children, imageHeight } = this.props;

		if ( imageUri === undefined ) {
			return null;
		}

		const featuredImageStyle = {
			backgroundImage: 'url(' + cssSafeUrl( imageUri ) + ')',
			backgroundSize: 'cover',
			backgroundRepeat: 'no-repeat',
			backgroundPosition: 'right center'
		};

		if ( this.state.isExpanded ) {
			const viewportHeight = this.getViewportHeight();
			//const aspectRatio = this.getAspectRatio();

			const newImageHeight = Math.min( this.props.imageHeight, viewportHeight - 176 );
			featuredImageStyle.height = Math.min( newImageHeight, imageHeight );
		}

		const classes = classnames( {
			'reader-post-card__photo': true,
			'is-expanded': this.state.isExpanded
		} );

		return (
			<a className={ classes } href={ href } style={ featuredImageStyle } onClick={ this.handleClick }>
				{ children }
			</a>
		);
	}
}

PostPhoto.propTypes = {
	imageUri: React.PropTypes.string,
	imageHeight: React.PropTypes.number,
	href: React.PropTypes.string,
};

PostPhoto.defaultProps = {
	onClick: noop,
};

export default PostPhoto;
