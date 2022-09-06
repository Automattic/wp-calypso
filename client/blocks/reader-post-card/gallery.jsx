import classnames from 'classnames';
import PropTypes from 'prop-types';
import { Component } from 'react';
import ReaderExcerpt from 'calypso/blocks/reader-excerpt';
import AutoDirection from 'calypso/components/auto-direction';
import cssSafeUrl from 'calypso/lib/css-safe-url';
import resizeImageUrl from 'calypso/lib/resize-image-url';
import { imageIsBigEnoughForGallery } from 'calypso/state/reader/posts/normalization-rules';
import { READER_CONTENT_WIDTH } from 'calypso/state/reader/posts/sizes';

const noop = () => {};

class PostGallery extends Component {
	state = {
		itemSelected: 0,
		listItems: null,
	};

	handleClick = ( event ) => {
		event.preventDefault();
		let updateItemSelected;
		updateItemSelected = this.state.itemSelected + 1;
		if ( updateItemSelected >= this.state.listItems.length ) {
			updateItemSelected = 0;
		}
		this.setState( { itemSelected: updateItemSelected } );
	};

	getGalleryWorthyImages = ( post ) => {
		const numberOfImagesToDisplay = 10;
		const images = ( post.images && [ ...post.images ] ) || [];

		return images
			.sort( ( a, b ) => ( a.width > b.width ? 1 : -1 ) )
			.filter( imageIsBigEnoughForGallery )
			.slice( 0, numberOfImagesToDisplay );
	};

	render() {
		const { post, children, isDiscover } = this.props;
		const imagesToDisplay = this.getGalleryWorthyImages( post );
		this.state.listItems = imagesToDisplay.map( ( image, index ) => {
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
				hide: index !== this.state.itemSelected,
				show: index === this.state.itemSelected,
			} );

			return (
				<li key={ `post-${ post.ID }-image-${ index }` } className={ classes }>
					<div
						className="reader-post-card__gallery-image"
						style={ imageStyle }
						onClick={ this.handleClick }
						role="presentation"
					/>
				</li>
			);
		} );
		const circles = this.state.listItems.map( ( value, index ) => {
			const classes = classnames( {
				'reader-post-card__gallery-circle': true,
				'is-selected': index === this.state.itemSelected,
			} );
			return <div className={ classes }></div>;
		} );
		return (
			<div className="reader-post-card__post">
				<ul className="reader-post-card__gallery">{ this.state.listItems }</ul>
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
