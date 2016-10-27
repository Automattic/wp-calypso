/**
 * External Dependencies
 */
import React from 'react';
import { throttle, constant } from 'lodash';
import ReactDom from 'react-dom';
import { translate } from 'i18n-calypso'; // @todo use localize HOC instead

/**
 * Internal Dependencies
 */
import EmbedHelper from 'reader/embed-helper';
import FeaturedImage from './featured-image';

class FeaturedVideo extends React.Component {

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
			Object.assign( iframe.style, this.getEmbedSize() );
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
		const { thumbnailUrl, autoplayIframe, iframe } = this.props;
		const preferThumbnail = this.state.preferThumbnail;

		if ( preferThumbnail && thumbnailUrl ) {
			return (
				<FeaturedImage imageUri={ thumbnailUrl } onClick={ this.handleThumbnailClick }>
					<div className="reader-post-card__play-icon-container"
						title={ translate( 'Click to Play' ) }>
						<img className="reader-post-card__play-icon" src="/calypso/images/reader/play-icon.png" />
					</div>
				</FeaturedImage>
			);
		}

		/* eslint-disable react/no-danger */
		return (
			<div ref={ this.setVideoEmbedRef }
				dangerouslySetInnerHTML={ { __html: thumbnailUrl ? autoplayIframe : iframe } }
			/>
		);
		/* eslint-enable-line react/no-danger */
	}
}

export default FeaturedVideo;
