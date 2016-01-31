/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import omitBy from 'lodash/omitBy';
import find from 'lodash/collection/find';
import QueryString from 'querystring';
import tinymce from 'tinymce/tinymce';

/**
 * Internal dependencies
 */
import shortcodeUtils from 'lib/shortcode';
import MediaUtils from 'lib/media/utils';

class WpVideoView extends Component {

	getVideoAttributes( videopress_guid ) {
		if ( this.props.media ) {
			return find( this.props.media, item => MediaUtils.isVideoPressItem( item ) && item.videopress_guid === videopress_guid );
		}
	}

	constrainVideoDimensions( shortcodeWidthAttribute, shortcodeHeightAttribute, videoWidth, videoHeight ) {
		const defaultWidth = 640;
		const defaultAspectRatio = 16 / 9;
		const aspectRatio = videoWidth && videoHeight ? videoWidth / videoHeight : defaultAspectRatio;
		let width = defaultWidth,
			height = defaultWidth / defaultAspectRatio;

		if ( shortcodeWidthAttribute && ! shortcodeHeightAttribute ) {
			width = shortcodeWidthAttribute;
			height = shortcodeWidthAttribute / aspectRatio;
		} else if ( ! shortcodeWidthAttribute && shortcodeHeightAttribute ) {
			width = shortcodeHeightAttribute * aspectRatio;
			height = shortcodeHeightAttribute;
		} else if ( shortcodeWidthAttribute && shortcodeHeightAttribute ) {
			const definedAspectRatio = shortcodeWidthAttribute / shortcodeHeightAttribute;
			if ( definedAspectRatio > aspectRatio ) {
				width = shortcodeHeightAttribute * aspectRatio;
				height = shortcodeHeightAttribute;
			} else {
				width = shortcodeWidthAttribute;
				height = shortcodeWidthAttribute / aspectRatio;
			}
		} else if ( videoWidth && videoHeight ) {
			width = videoWidth;
			height = videoHeight;
		}

		return { width, height };
	}

	getShortCodeAttributes() {
		const shortcode = shortcodeUtils.parse( this.props.content );
		const namedAttrs = shortcode.attrs.named;
		const videopress_guid = shortcode.attrs.numeric[0];

		const defaultAttrValues = { hd: false, at: 0, defaultLangCode: undefined };

		const videoAttributes = this.getVideoAttributes( shortcode.attrs.numeric[0] ) || {};
		const videoDimensions = this.constrainVideoDimensions(
			parseInt( namedAttrs.w, 10 ) || undefined,
			parseInt( namedAttrs.h, 10 ) || undefined,
			videoAttributes.width,
			videoAttributes.height );

		const attrs = {
			videopress_guid,
			w: videoDimensions.width,
			h: videoDimensions.height,
			autoplay: namedAttrs.autoplay === 'true',
			hd: namedAttrs.hd === 'true',
			loop: namedAttrs.loop === 'true',
			at: parseInt( namedAttrs.at, 10 ) || 0,
			defaultLangCode: namedAttrs.defaultlangcode
		};

		return omit( attrs, ( value, key ) => defaultAttrValues[key] === value );
	}

	getEmbedUrl( attrs ) {
		const queryString = QueryString.stringify( omitBy( attrs, ['videopress_guid', 'w', 'h'] ) );

		return `https://videopress.com/embed/${ attrs.videopress_guid }?${ queryString }`;
	}

	onLoad() {
		const doc = tinymce.activeEditor.iframeElement.contentDocument;
		const script = doc.createElement( 'script' );
		script.src = 'https://videopress.com/videopress-iframe.js';
		script.type = 'text/javascript';
		doc.getElementsByTagName( 'head' )[0].appendChild( script );
	}

	render() {
		const attrs = this.getShortCodeAttributes();

		return (
			<div className="wpview-content">
				<iframe
					onLoad={ this.onLoad }
					width={ attrs.w }
					height={ attrs.h }
					src={ this.getEmbedUrl( attrs ) }
					className="wpview-type-video"
					frameBorder="0"
					allowFullScreen />
			</div>
		);
	}

}

WpVideoView.propTypes = {
	media: PropTypes.array,
	content: PropTypes.string
};

export default WpVideoView;
