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

	// might need to debounce this
	getViewportHeight() {
		return Math.max( document.documentElement.clientHeight, window.innerHeight || 0 );
	}

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
			featuredImageStyle.height = Math.min( viewportHeight - 176, imageHeight );
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
