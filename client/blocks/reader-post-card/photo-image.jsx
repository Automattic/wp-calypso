/** @format */
/**
 * External Dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import { noop } from 'lodash';
import classnames from 'classnames';

/**
 * Internal Dependencies
 */
import AutoDirection from 'components/auto-direction';
import Emojify from 'components/emojify';
import cssSafeUrl from 'lib/css-safe-url';

class PostPhotoImage extends React.Component {
	render() {
		const { post, title, onClick } = this.props;
		const imageUrl = post.canonical_media.src;
		const imageSize = {
			height: post.canonical_media.height,
			width: post.canonical_media.width,
		};

		const featuredImageStyle = {
			backgroundImage: 'url(' + cssSafeUrl( imageUrl ) + ')',
			backgroundSize: this.props.isExpanded ? 'contain' : 'cover',
			backgroundRepeat: 'no-repeat',
			backgroundPosition: 'center',
		};

		let newWidth, newHeight;
		if ( this.props.isExpanded ) {
			const cardWidth = this.state.cardWidth;
			const { width: naturalWidth, height: naturalHeight } = imageSize;

			newHeight = Math.min( naturalHeight / naturalWidth * cardWidth, this.getMaxPhotoHeight() );
			newWidth = naturalWidth / naturalHeight * newHeight;
			featuredImageStyle.height = newHeight;
			featuredImageStyle.width = newWidth;
		}

		const classes = classnames( {
			'reader-post-card__photo': true,
			'is-expanded': this.props.isExpanded,
		} );

		// force to non-breaking space if `title` is empty so that the title h1 doesn't collapse and
		// complicate things
		const linkTitle = title || '\xa0';
		const divStyle = this.props.isExpanded
			? { height: newHeight, width: newWidth, margin: '0 auto' }
			: {};

		return (
			<div style={ divStyle }>
				<a className={ classes } href={ post.URL } style={ featuredImageStyle } onClick={ onClick }>
					<div ref={ this.handleWidthDivLoaded } style={ { width: '100%' } } />
				</a>
				<AutoDirection>
					<h1 className="reader-post-card__title">
						<a className="reader-post-card__title-link" href={ post.URL } onClick={ onClick }>
							<Emojify>{ linkTitle }</Emojify>
						</a>
					</h1>
				</AutoDirection>
			</div>
		);
	}
}

PostPhotoImage.propTypes = {
	post: PropTypes.object,
	title: PropTypes.string,
	onClick: PropTypes.func,
	isExpanded: PropTypes.bool,
};

PostPhotoImage.defaultProps = {
	onClick: noop,
};

export default PostPhotoImage;
