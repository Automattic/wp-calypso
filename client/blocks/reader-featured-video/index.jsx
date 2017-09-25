/** @format */
/**
 * External dependencies
 */
import classnames from 'classnames';
import { localize } from 'i18n-calypso';
import { throttle, constant, noop } from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import ReactDom from 'react-dom';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import ReaderFeaturedImage from 'blocks/reader-featured-image';
import QueryReaderThumbnail from 'components/data/query-reader-thumbnails';
import EmbedHelper from 'reader/embed-helper';
import { getThumbnailForIframe } from 'state/reader/thumbnails/selectors';

class ReaderFeaturedVideo extends React.Component {
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
		expandCard: PropTypes.func,
	};

	static defaultProps = {
		allowPlaying: true,
		onThumbnailClick: noop,
		className: '',
	};

	setVideoSizingStrategy = videoEmbed => {
		let sizingFunction = constant( {} );
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

	handleThumbnailClick = e => {
		if ( this.props.allowPlaying ) {
			e.preventDefault();
			this.props.onThumbnailClick();
		}
	};

	setVideoEmbedRef = c => {
		this.videoEmbedRef = c;
		this.setVideoSizingStrategy( this.props.videoEmbed );
	};

	componentDidMount() {
		if ( this.props.allowPlaying ) {
			global.window && global.window.addEventListener( 'resize', this.throttledUpdateVideoSize );
		}
	}

	componentWillUnmount() {
		if ( this.props.allowPlaying ) {
			global.window && global.window.removeEventListener( 'resize', this.throttledUpdateVideoSize );
		}
	}

	componentWillReceiveProps() {
		this.throttledUpdateVideoSize();
	}

	render() {
		const {
			thumbnailUrl,
			autoplayIframe,
			iframe,
			translate,
			allowPlaying,
			className,
			href,
			isExpanded,
		} = this.props;

		if ( ! isExpanded && thumbnailUrl ) {
			return (
				<ReaderFeaturedImage
					imageUrl={ thumbnailUrl }
					onClick={ this.handleThumbnailClick }
					className={ className }
					href={ href }
				>
					{ allowPlaying && (
						<img
							className="reader-featured-video__play-icon"
							src="/calypso/images/reader/play-icon.png"
							title={ translate( 'Play Video' ) }
						/>
					) }
				</ReaderFeaturedImage>
			);
		}

		// if we can't retrieve a thumbnail that means there was an issue
		// with the embed and we shouldn't display it
		const showEmbed = !! thumbnailUrl;
		const classNames = classnames( className, 'reader-featured-video' );

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

const mapStateToProps = ( state, ownProps ) => ( {
	thumbnailUrl: getThumbnailForIframe( state, ownProps.videoEmbed.src ),
} );

export default connect( mapStateToProps )( localize( ReaderFeaturedVideo ) );
