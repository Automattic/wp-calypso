/**
 * External Dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { throttle, constant } from 'lodash';
import ReactDom from 'react-dom';
import { localize } from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import EmbedHelper from 'reader/embed-helper';
import FeaturedImage from './featured-image';
import { getThumbnailForIframe } from 'state/reader/thumbnails/selectors';
import QueryReaderThumbnail from 'components/data/query-reader-thumbnails';

class FeaturedVideo extends React.Component {

	static propTypes = {
		thumbnailUrl: React.PropTypes.string,
		autoplayIframe: React.PropTypes.string,
		iframe: React.PropTypes.string,
		videoEmbed: React.PropTypes.object,
	}

	constructor( props ) {
		super( props );
		this.state = {
			preferThumbnail: true
		};
	}

	setVideoSizingStrategy = ( videoEmbed ) => {
		let sizingFunction = constant( {} );
		if ( videoEmbed ) {
			const maxWidth = ReactDom.findDOMNode( this ).parentNode.offsetWidth;
			const embedSize = EmbedHelper.getEmbedSizingFunction( videoEmbed );

			sizingFunction = ( available = maxWidth ) => embedSize( available );
		}
		this.getEmbedSize = sizingFunction;
	}

	updateVideoSize = () => {
		if ( this.videoEmbedRef ) {
			const iframe = ReactDom.findDOMNode( this.videoEmbedRef ).querySelector( 'iframe' );
			const availableWidth = ReactDom.findDOMNode( this ).parentNode.offsetWidth;

			Object.assign( iframe.style, this.getEmbedSize( availableWidth ) );
		}
	}

	handleThumbnailClick = ( e ) => {
		e.preventDefault();
		this.setState( { preferThumbnail: false }, () => this.updateVideoSize() );
	}

	setVideoEmbedRef = ( c ) => {
		this.videoEmbedRef = c;
		this.setVideoSizingStrategy( this.props.videoEmbed );
	}

	componentDidMount() {
		window.addEventListener( 'resize', throttle( this.updateVideoSize, 100 ) );
	}

	render() {
		const { thumbnailUrl, autoplayIframe, iframe, translate } = this.props;
		const preferThumbnail = this.state.preferThumbnail;

		if ( preferThumbnail && thumbnailUrl ) {
			return (
				<FeaturedImage imageUri={ thumbnailUrl } onClick={ this.handleThumbnailClick } >
					<img className="reader-post-card__play-icon"
						src="/calypso/images/reader/play-icon.png"
						title={ translate( 'Play Video' ) }
					/>
				</FeaturedImage>
			);
		}

		// if we can't retrieve a thumbnail that means there was an issue
		// with the embed and we shouldn't display it
		const showEmbed = !! this.props.thumbnailUrl;

		/* eslint-disable react/no-danger */
		return (
			<div>
				<QueryReaderThumbnail embedUrl={ this.props.videoEmbed.src } />
				{ showEmbed &&
					<div ref={ this.setVideoEmbedRef } className="reader-post-card__video"
						dangerouslySetInnerHTML={ { __html: thumbnailUrl ? autoplayIframe : iframe } }
					/>
				}
			</div>
		);
		/* eslint-enable-line react/no-danger */
	}
}

const mapStateToProps = ( state, ownProps ) => ( {
	thumbnailUrl: getThumbnailForIframe( state, ownProps.videoEmbed.src ),
} );

export default connect( mapStateToProps )( localize( FeaturedVideo ) );
