/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import omitBy from 'lodash/omitBy';
import pick from 'lodash/pick';
import includes from 'lodash/includes';
import QueryString from 'querystring';

/**
 * Internal dependencies
 */
import shortcodeUtils from 'lib/shortcode';
import { getVideo } from 'state/videos/selectors';
import QueryVideo from 'components/data/query-video';

class WpVideoView extends Component {

	static match( content ) {
		const match = shortcodeUtils.next( 'wpvideo', content );

		if ( match ) {
			return {
				index: match.index,
				content: match.content,
				options: {
					shortcode: match.shortcode
				}
			};
		}
	}

	static serialize( content ) {
		return encodeURIComponent( content );
	}

	constrainVideoDimensions( shortcodeWidthAttribute, shortcodeHeightAttribute ) {
		const defaultWidth = 640;
		const defaultAspectRatio = 16 / 9;
		let { width = defaultWidth, height = defaultWidth / defaultAspectRatio } = this.props.video || {};
		const aspectRatio = width / height;

		if ( shortcodeWidthAttribute && ! shortcodeHeightAttribute ) {
			width = shortcodeWidthAttribute;
			height = shortcodeWidthAttribute / aspectRatio;
		} else if ( ! shortcodeWidthAttribute && shortcodeHeightAttribute ) {
			width = shortcodeHeightAttribute * aspectRatio;
			height = shortcodeHeightAttribute;
		} else if ( shortcodeWidthAttribute && shortcodeHeightAttribute ) {
			width = shortcodeWidthAttribute;
			height = shortcodeHeightAttribute;
		}

		return { width, height };
	}

	getVideoAttributes() {
		const shortcode = shortcodeUtils.parse( this.props.content );
		const namedAttrs = shortcode.attrs.named;
		const numericAttrs = shortcode.attrs.numeric;

		const videoDimensions = this.constrainVideoDimensions(
			parseInt( namedAttrs.w, 10 ),
			parseInt( namedAttrs.h, 10 )
		);

		const shortcodeAttributes = {
			guid: numericAttrs[0],
			w: videoDimensions.width,
			h: videoDimensions.height,
			autoplay: includes( [ 'true', '1' ], namedAttrs.autoplay ) || includes( numericAttrs, 'autoplay' ),
			hd: includes( [ 'true', '1' ], namedAttrs.hd ) || includes( numericAttrs, 'hd' ),
			loop: includes( [ 'true', '1' ], namedAttrs.loop ) || includes( numericAttrs, 'loop' ),
			permalink: includes( [ 'true', '1' ], namedAttrs.permalink ) || includes( numericAttrs, 'permalink' ),
			at: parseInt( namedAttrs.at, 10 ) || 0,
			defaultLangCode: namedAttrs.defaultlangcode
		};

		return Object.assign(
			pick( shortcodeAttributes, [ 'guid', 'w', 'h' ] ),
			{ embedUrl: this.getEmbedUrl( shortcodeAttributes ) }
		);
	}

	getEmbedUrl( shortcodeAttributes ) {
		const defaultAttributeValues = { hd: false, at: 0, defaultLangCode: undefined };
		const attributesWithNonDefaultValues = omitBy(
			shortcodeAttributes,
			( value, key ) => defaultAttributeValues[ key ] === value );
		const queryStringAttributes = [ 'autoplay', 'hd', 'loop', 'permalink', 'at', 'defaultLangCode' ];
		const queryString = QueryString.stringify( pick( attributesWithNonDefaultValues, queryStringAttributes ) );

		return `https://videopress.com/embed/${ shortcodeAttributes.guid }?${ queryString }`;
	}

	onLoad() {
		const doc = this.props.editor.iframeElement.contentDocument;
		const script = doc.createElement( 'script' );
		script.src = 'https://videopress.com/videopress-iframe.js';
		script.type = 'text/javascript';
		doc.getElementsByTagName( 'head' )[0].appendChild( script );
	}

	render() {
		const videoAttributes = this.getVideoAttributes();

		return (
			<div className="wpview-content">
				<QueryVideo guid={ videoAttributes.guid } />
				<iframe
					onLoad={ this.onLoad.bind( this ) }
					width={ videoAttributes.w }
					height={ videoAttributes.h }
					src={ videoAttributes.embedUrl }
					className="wpview-type-video"
					frameBorder="0"
					allowFullScreen />
			</div>
		);
	}

}

WpVideoView.propTypes = {
	content: PropTypes.string,
	editor: PropTypes.object,
	video: PropTypes.object
};

export default connect( ( state, props ) => {
	const guid = shortcodeUtils.parse( props.content ).attrs.numeric[0];
	return {
		video: getVideo( state, guid )
	};
} )( WpVideoView );
