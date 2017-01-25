/**
 * External Dependencies
 */
import React from 'react';
import { noop, debounce } from 'lodash';
import classnames from 'classnames';

/**
 * Internal Dependencies
 */
import AutoDirection from 'components/auto-direction';
import * as stats from 'reader/stats';
import PostStoreActions from 'lib/feed-post-store/actions';
import cssSafeUrl from 'lib/css-safe-url';

class PostPhoto extends React.Component {

	state = {
		isExpanded: false,
		cardWidth: 800,
	};

	handleClick = ( event ) => {
		if ( this.state.isExpanded ) {
			this.props.onClick( event );
			return;
		}

		event.preventDefault();
		this.setState( { isExpanded: true } );
		this.onExpanded();
	}

	onExpanded = () => {
		const { post, site } = this.props;
		stats.recordTrackForPost( 'calypso_reader_photo_expanded', post );

		// Record page view
		PostStoreActions.markSeen( post, site );
		stats.recordTrackForPost( 'calypso_reader_article_opened', post );
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
		if ( this.widthDivRef ) {
			const cardWidth = this.widthDivRef.getClientRects()[ 0 ].width;
			if ( cardWidth > 0 ) {
				this.setState( { cardWidth } );
			}
		}
	}

	handleWidthDivLoaded = ( ref ) => {
		this.widthDivRef = ref;
	}

	componentDidMount() {
		this.resizeListener = window.addEventListener( 'resize', debounce( this.setCardWidth, 50 ) );
		this.setCardWidth();
	}

	componentWillUnmount() {
		window.removeEventListener( 'resize', this.resizeListener );
	}

	renderFeaturedImage() {
		const { post, title } = this.props;
		const imageUri = post.canonical_media.src;
		const imageSize = {
			height: post.canonical_media.height,
			width: post.canonical_media.width
		};

		const featuredImageStyle = {
			backgroundImage: 'url(' + cssSafeUrl( imageUri ) + ')',
			backgroundSize: this.state.isExpanded ? 'contain' : 'cover',
			backgroundRepeat: 'no-repeat',
			backgroundPosition: 'center'
		};

		let newWidth, newHeight;
		if ( this.state.isExpanded ) {
			const cardWidth = this.state.cardWidth;
			const { width: naturalWidth, height: naturalHeight } = imageSize;

			newHeight = Math.min(
				( naturalHeight / naturalWidth ) * cardWidth,
				this.getMaxPhotoHeight(),
			);
			newWidth = ( naturalWidth / naturalHeight ) * newHeight;
			featuredImageStyle.height = newHeight;
			featuredImageStyle.width = newWidth;
		}

		const classes = classnames( {
			'reader-post-card__photo': true,
			'is-expanded': this.state.isExpanded
		} );

		// force to non-breaking space if `title` is empty so that the title h1 doesn't collapse and complicate things
		const linkTitle = title || '\xa0';
		const divStyle = this.state.isExpanded
			? { height: newHeight, width: newWidth, margin: '0 auto' }
			: {};

		return (
			<div style={ divStyle } >
				<a className={ classes } href={ post.URL } style={ featuredImageStyle } onClick={ this.handleClick }>
					<div ref={ this.handleWidthDivLoaded } style={ { width: '100%' } }></div>
				</a>
				<AutoDirection>
					<h1 className="reader-post-card__title">
						<a className="reader-post-card__title-link" href={ post.URL } onClick={ this.props.onClick }>{ linkTitle }</a>
					</h1>
				</AutoDirection>
			</div>
		);
	}

	render() {
		const { post, children } = this.props;
		const featuredImage = !! post.canonical_media.src ? this.renderFeaturedImage() : null;

		return (
			<div className="reader-post-card__post" >
				{ featuredImage }
				<div className="reader-post-card__post-details" >
					{ children }
				</div>
			</div>
		);
	}
}

PostPhoto.propTypes = {
	post: React.PropTypes.object,
	site: React.PropTypes.object,
	title: React.PropTypes.string,
	onClick: React.PropTypes.func,
};

PostPhoto.defaultProps = {
	onClick: noop,
};

export default PostPhoto;
