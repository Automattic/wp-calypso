import PropTypes from 'prop-types';
import ReaderExcerpt from 'calypso/blocks/reader-excerpt';
import AutoDirection from 'calypso/components/auto-direction';
import cssSafeUrl from 'calypso/lib/css-safe-url';
import { isFeaturedImageInContent } from 'calypso/lib/post-normalizer/utils';
import resizeImageUrl from 'calypso/lib/resize-image-url';
import { imageIsBigEnoughForGallery } from 'calypso/state/reader/posts/normalization-rules';
import { READER_CONTENT_WIDTH } from 'calypso/state/reader/posts/sizes';
import { Component } from 'react';
import classnames from 'classnames';

const noop = () => {};

class PostGallery extends Component {
	handleClick = ( event ) => {
		event.preventDefault();
		//event.stopPropagation();
		console.log( event );
	};

	getGalleryWorthyImages = ( post ) => {
		const numberOfImagesToDisplay = 4;
		const images = ( post.images && [ ...post.images ] ) || [];
		const indexToRemove = isFeaturedImageInContent( post );
		if ( indexToRemove ) {
			images.splice( indexToRemove, 1 );
		}

		return images.filter( imageIsBigEnoughForGallery ).slice( 0, numberOfImagesToDisplay );
	};

	render() {
		const { post, children, isDiscover } = this.props;
		const imagesToDisplay = this.getGalleryWorthyImages( post );
		const listItems = imagesToDisplay.map( ( image, index ) => {
			const imageUrl = resizeImageUrl( image.src, {
				w: READER_CONTENT_WIDTH,
			} );
			const safeCssUrl = cssSafeUrl( imageUrl );
			let imageStyle = { background: 'none' };
			if ( safeCssUrl ) {
				imageStyle = {
					backgroundImage: 'url(' + safeCssUrl + ')',
					backgroundSize: 'cover',
					backgroundPosition: '50% 50%',
					backgroundRepeat: 'no-repeat',
				};
			}

			const classes = classnames( {
				'reader-post-card__gallery-item': true,
				hide: index > 0,
				show: index === 0,
			} );

			return (
				<li key={ `post-${ post.ID }-image-${ index }` } className={ classes }>
					<div
						className="reader-post-card__gallery-image"
						style={ imageStyle }
						onClick={ this.handleClick }
					/>
				</li>
			);
		} );
		const circles = listItems.map( ( value, index ) => {
			const classes = classnames( {
				'reader-post-card__gallery-circle': true,
				'is-selected': index === 0,
			} );
			return <div className={ classes }></div>;
		} );
		return (
			<div className="reader-post-card__post">
				<ul className="reader-post-card__gallery">{ listItems }</ul>
				<div className="reader-post-card__gallery-circles">{ circles }</div>
				<div className="reader-post-card__post-details">
					<AutoDirection>
						<h2 className="reader-post-card__title">
							<a className="reader-post-card__title-link" href={ post.URL }>
								{ post.title }
							</a>
						</h2>
					</AutoDirection>
					<ReaderExcerpt post={ post } isDiscover={ isDiscover } />
					{ children }
				</div>
			</div>
		);
	}
}

PostGallery.propTypes = {
	post: PropTypes.object.isRequired,
	isDiscover: PropTypes.bool,
	onClick: PropTypes.func,
};

PostGallery.defaultProps = {
	onClick: noop,
};

export default PostGallery;
