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
		if ( this.props.isExpanded || ! this.imageFillsCollapsedSlot() ) {
			this.props.onClick( event );
			return;
		}

		event.preventDefault();
		const { post, site, postKey } = this.props;
		this.props.expandCard( { post, site, postKey } );
	};

	imageFillsCollapsedSlot() {
		const { width: naturalWidth, height: naturalHeight } = this.props.post?.canonical_media ?? {};
		const { cardWidth } = this.state;

		// Cover upscales a photo that is smaller than the slot on either axis.
		return cardWidth > 0 && naturalWidth > cardWidth && naturalHeight > COLLAPSED_PHOTO_HEIGHT;
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
		if ( ! this.widthDivRef ) {
			return;
		}

		const cardWidth = this.widthDivRef.getClientRects()[ 0 ]?.width;
		if ( cardWidth > 0 ) {
			this.setState( { cardWidth } );
		}
	};

	handleWidthDivLoaded = ( ref ) => {
		this.widthDivRef = ref;
	};

	componentDidMount() {
		this.resizeListener = window.addEventListener( 'resize', debounce( this.setCardWidth, 50 ) );
		this.setCardWidth();
	}

	componentWillUnmount() {
		window.removeEventListener( 'resize', this.resizeListener );
	}

	renderFeaturedImage() {
		const { post, title } = this.props;
		const imageUrl = post.canonical_media.src;
		const naturalWidth = post.canonical_media.width;
		const naturalHeight = post.canonical_media.height;
		const fillsCollapsedSlot = ! this.props.isExpanded && this.imageFillsCollapsedSlot();

		const featuredImageStyle = {
			backgroundImage: 'url(' + cssSafeUrl( imageUrl ) + ')',
			backgroundSize: fillsCollapsedSlot ? 'cover' : 'contain',
			backgroundRepeat: 'no-repeat',
			backgroundPosition: 'center',
		};

		let newWidth;
		let newHeight;
		if ( this.props.isExpanded ) {
			const { cardWidth } = this.state;
			const maxPhotoHeight = this.getMaxPhotoHeight();

			if ( naturalWidth > 0 && naturalHeight > 0 && cardWidth > 0 ) {
				const scale = Math.min( 1, cardWidth / naturalWidth, maxPhotoHeight / naturalHeight );
				newWidth = naturalWidth * scale;
				newHeight = naturalHeight * scale;
				featuredImageStyle.height = newHeight;
				featuredImageStyle.width = newWidth;
			} else {
				featuredImageStyle.maxWidth = '100%';
			}
		}

		const classes = clsx( {
			'reader-post-card__photo': true,
			'is-expanded': this.props.isExpanded,
			'is-zoomable': fillsCollapsedSlot,
		} );

		// force to non-breaking space if `title` is empty so that the title h1 doesn't collapse and complicate things
		const linkTitle = title || '\xa0';
		const divStyle = this.props.isExpanded
			? {
					margin: '0 auto',
					maxWidth: '100%',
					...( newWidth > 0 && newHeight > 0 ? { height: newHeight, width: newWidth } : {} ),
				}
			: {};

		return (
			<div style={ divStyle }>
				<a
					className={ classes }
					href={ post.URL }
					style={ featuredImageStyle }
					onClick={ this.handleClick }
				>
					<div ref={ this.handleWidthDivLoaded } style={ { width: '100%' } } />
				</a>
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
			<div className="reader-post-card__post">
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
