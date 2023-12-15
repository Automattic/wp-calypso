import classnames from 'classnames';
import { localize } from 'i18n-calypso';
import { throttle } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';
import ReactDom from 'react-dom';
import { connect } from 'react-redux';
import playIconImage from 'calypso/assets/images/reader/play-icon.png';
import ReaderFeaturedImage from 'calypso/blocks/reader-featured-image';
import QueryReaderThumbnail from 'calypso/components/data/query-reader-thumbnails';
import EmbedHelper from 'calypso/reader/embed-helper';
import {
	READER_COMPACT_POST_FEATURED_MAX_IMAGE_HEIGHT,
	READER_COMPACT_POST_FEATURED_MAX_IMAGE_WIDTH,
} from 'calypso/state/reader/posts/sizes';
import { getThumbnailForIframe } from 'calypso/state/reader/thumbnails/selectors';

import './style.scss';

const noop = () => {};
const defaultSizingFunction = () => ( {} );

class ReaderFeaturedVideo extends Component {
	static propTypes = {
		thumbnailUrl: PropTypes.string,
		autoplayIframe: PropTypes.string,
		iframe: PropTypes.string,
		videoEmbed: PropTypes.object,
		allowPlaying: PropTypes.bool,
		onThumbnailClick: PropTypes.func,
		className: PropTypes.string,
		href: PropTypes.string,
		isExpanded: PropTypes.bool,
		isCompactPost: PropTypes.bool,
		expandCard: PropTypes.func,
		hasExcerpt: PropTypes.bool,
	};

	static defaultProps = {
		allowPlaying: true,
		onThumbnailClick: noop,
		className: '',
	};

	setVideoSizingStrategy = ( videoEmbed ) => {
		let sizingFunction = defaultSizingFunction;
		if ( videoEmbed ) {
			const maxWidth = ReactDom.findDOMNode( this ).parentNode.offsetWidth;
			const embedSize = EmbedHelper.getEmbedSizingFunction( videoEmbed );

			sizingFunction = ( available = maxWidth ) => embedSize( available );
		}
		this.getEmbedSize = sizingFunction;
	};

	updateVideoSize = () => {
		if ( this.videoEmbedRef ) {
			const iframe = ReactDom.findDOMNode( this.videoEmbedRef ).querySelector( 'iframe' );
			const availableWidth = ReactDom.findDOMNode( this ).parentNode.offsetWidth;

			Object.assign( iframe.style, this.getEmbedSize( availableWidth ) );
		}
	};

	throttledUpdateVideoSize = throttle( this.updateVideoSize, 100 );

	handleThumbnailClick = ( e ) => {
		if ( this.props.allowPlaying ) {
			e.preventDefault();
			this.props.onThumbnailClick();
		}
	};

	setVideoEmbedRef = ( c ) => {
		this.videoEmbedRef = c;
		this.setVideoSizingStrategy( this.props.videoEmbed );
	};

	componentDidMount() {
		if ( this.props.allowPlaying && typeof window !== 'undefined' ) {
			window.addEventListener( 'resize', this.throttledUpdateVideoSize );
		}
	}

	componentWillUnmount() {
		if ( this.props.allowPlaying && typeof window !== 'undefined' ) {
			window.removeEventListener( 'resize', this.throttledUpdateVideoSize );
		}
	}

	componentDidUpdate() {
		this.throttledUpdateVideoSize();
	}

	render() {
		const {
			videoEmbed,
			thumbnailUrl,
			autoplayIframe,
			iframe,
			translate,
			allowPlaying,
			className,
			href,
			isExpanded,
			isCompactPost,
			hasExcerpt,
		} = this.props;

		const classNames = classnames( className, 'reader-featured-video' );

		if ( ! isExpanded && thumbnailUrl ) {
			return (
				<ReaderFeaturedImage
					canonicalMedia={ videoEmbed }
					imageUrl={ thumbnailUrl }
					onClick={ this.handleThumbnailClick }
					className={ classNames }
					href={ href }
					fetched={ true }
					isCompactPost={ isCompactPost }
					hasExcerpt={ hasExcerpt }
				>
					{ allowPlaying && (
						<img
							className="reader-featured-video__play-icon"
							src={ playIconImage }
							title={ translate( 'Play Video' ) }
							alt={ translate( 'Play button' ) }
						/>
					) }
				</ReaderFeaturedImage>
			);
		}

		// if we can't retrieve a thumbnail that means there was an issue
		// with the embed and we shouldn't display it
		const showEmbed = !! thumbnailUrl;

		/* eslint-disable react/no-danger */
		return (
			<div className={ classNames }>
				<QueryReaderThumbnail embedUrl={ this.props.videoEmbed.src } />
				{ showEmbed && (
					<div
						ref={ this.setVideoEmbedRef }
						className="reader-featured-video__video"
						dangerouslySetInnerHTML={ { __html: thumbnailUrl ? autoplayIframe : iframe } }
					/>
				) }
			</div>
		);
		/* eslint-enable-line react/no-danger */
	}
}

const checkEmbedSizeDimensions = ( embed ) => {
	let _embed = embed;
	// convert frame to a DOM element if frame is a string
	if ( _embed && typeof _embed === 'string' ) {
		_embed = new DOMParser().parseFromString( _embed, 'text/html' )?.body?.firstChild;
	}
	// set width and height to max width and height if they are not set
	if ( _embed.width === 0 && _embed.height === 0 ) {
		_embed.width = READER_COMPACT_POST_FEATURED_MAX_IMAGE_WIDTH;
		_embed.height = READER_COMPACT_POST_FEATURED_MAX_IMAGE_HEIGHT;
		_embed.aspectRatio =
			READER_COMPACT_POST_FEATURED_MAX_IMAGE_WIDTH / READER_COMPACT_POST_FEATURED_MAX_IMAGE_HEIGHT;
	}
	return _embed;
};

const mapStateToProps = ( state, ownProps ) => {
	// Check if width and height are set for the embed
	const videoEmbed = checkEmbedSizeDimensions( ownProps.videoEmbed );
	return {
		videoEmbed: videoEmbed,
		iframe: checkEmbedSizeDimensions( ownProps.iframe )?.outerHTML,
		autoplayIframe: checkEmbedSizeDimensions( ownProps.autoplayIframe )?.outerHTML,
		thumbnailUrl: getThumbnailForIframe( state, videoEmbed.src ),
	};
};

export default connect( mapStateToProps )( localize( ReaderFeaturedVideo ) );
