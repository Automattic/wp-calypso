import { debounce } from '@wordpress/compose';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { Component } from 'react';
import AutoDirection from 'calypso/components/auto-direction';
import cssSafeUrl from 'calypso/lib/css-safe-url';

const noop = () => {};

// Collapsed frame height from `.reader-post-card__photo` in style.scss.
const COLLAPSED_PHOTO_HEIGHT = 300;

class PostPhoto extends Component {
	state = {
		cardWidth: 0,
	};

	handleClick = ( event ) => {
		if ( this.props.isExpanded || ! this.canExpand() ) {
			this.props.onClick( event );
			return;
		}

		event.preventDefault();
		const { post, site, postKey } = this.props;
		this.props.expandCard( { post, site, postKey } );
	};

	getNaturalSize() {
		const { width, height } = this.props.post?.canonical_media ?? {};
		return width > 0 && height > 0 ? { width, height } : null;
	}

	imageExceedsCollapsedSlot() {
		const naturalSize = this.getNaturalSize();
		const { cardWidth } = this.state;

		// `background-size: cover` upscales a photo that is smaller than the slot on either axis.
		return (
			!! naturalSize &&
			cardWidth > 0 &&
			naturalSize.width > cardWidth &&
			naturalSize.height > COLLAPSED_PHOTO_HEIGHT
		);
	}

	// Scales the photo to fit within the card and `maxHeight` without upscaling it.
	getFittedSize( maxHeight ) {
		const naturalSize = this.getNaturalSize();
		const { cardWidth } = this.state;

		if ( ! naturalSize || cardWidth <= 0 || maxHeight <= 0 ) {
			return null;
		}

		const scale = Math.min( 1, cardWidth / naturalSize.width, maxHeight / naturalSize.height );
		return { width: naturalSize.width * scale, height: naturalSize.height * scale };
	}

	canExpand() {
		if ( this.imageExceedsCollapsedSlot() ) {
			return true;
		}

		const collapsedSize = this.getFittedSize( COLLAPSED_PHOTO_HEIGHT );
		const expandedSize = this.getFittedSize( this.getMaxPhotoHeight() );
		return !! collapsedSize && !! expandedSize && expandedSize.height > collapsedSize.height;
	}

	getViewportHeight = () =>
		Math.max( document.documentElement.clientHeight, window.innerHeight || 0 );

	/* We want photos to be able to expand to be essentially full-screen
	 * We settled on viewport height - 176px because the
	 *  - masterbar is 47px tall
	 *  - card header is 74px tall
	 *  - card footer is 55px tall
	 * 47 + 74 + 55 = 176
	 */
	getMaxPhotoHeight = () => this.getViewportHeight() - 176;

	setCardWidth = () => {
		if ( ! this.postRef ) {
			return;
		}

		const cardWidth = this.postRef.getClientRects()[ 0 ]?.width;
		if ( cardWidth > 0 ) {
			this.setState( { cardWidth } );
		}
	};

	handlePostRef = ( ref ) => {
		this.postRef = ref;
	};

	componentDidMount() {
		this.resizeListener = window.addEventListener( 'resize', debounce( this.setCardWidth, 50 ) );
		this.setCardWidth();
	}

	componentWillUnmount() {
		window.removeEventListener( 'resize', this.resizeListener );
	}

	renderFeaturedImage() {
		const { post, title, isExpanded } = this.props;
		const imageUrl = post.canonical_media.src;
		const fillsCollapsedSlot = ! isExpanded && this.imageExceedsCollapsedSlot();

		const featuredImageStyle = {
			backgroundImage: 'url(' + cssSafeUrl( imageUrl ) + ')',
			backgroundSize: fillsCollapsedSlot ? 'cover' : 'contain',
			backgroundRepeat: 'no-repeat',
			backgroundPosition: 'center',
		};

		// The photo frame shrinks to the photo so the title overlay and gradient stay on the image.
		const photoSize = fillsCollapsedSlot
			? null
			: this.getFittedSize( isExpanded ? this.getMaxPhotoHeight() : COLLAPSED_PHOTO_HEIGHT );

		if ( photoSize ) {
			featuredImageStyle.width = photoSize.width;
			featuredImageStyle.height = photoSize.height;
		}

		const classes = clsx( {
			'reader-post-card__photo': true,
			'is-expanded': isExpanded,
			'is-zoomable': ! isExpanded && this.canExpand(),
		} );

		// force to non-breaking space if `title` is empty so that the title h1 doesn't collapse and complicate things
		const linkTitle = title || '\xa0';
		const divStyle = photoSize
			? { width: photoSize.width, margin: '0 auto', maxWidth: '100%' }
			: {};

		return (
			<div style={ divStyle }>
				<a
					className={ classes }
					href={ post.URL }
					style={ featuredImageStyle }
					onClick={ this.handleClick }
				/>
				<AutoDirection>
					<h2 className="reader-post-card__title">
						<a
							className="reader-post-card__title-link"
							href={ post.URL }
							onClick={ this.props.onClick }
						>
							{ linkTitle }
						</a>
					</h2>
				</AutoDirection>
			</div>
		);
	}

	render() {
		const { post, children } = this.props;
		const featuredImage = post.canonical_media.src ? this.renderFeaturedImage() : null;

		return (
			<div className="reader-post-card__post" ref={ this.handlePostRef }>
				{ featuredImage }
				<div className="reader-post-card__post-details">{ children }</div>
			</div>
		);
	}
}

PostPhoto.propTypes = {
	post: PropTypes.object,
	site: PropTypes.object,
	title: PropTypes.string,
	onClick: PropTypes.func,
};

PostPhoto.defaultProps = {
	onClick: noop,
};

export default PostPhoto;
