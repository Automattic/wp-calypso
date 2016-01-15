/**
 * External dependencies
 */
import React, { Component } from 'react';
import defaults from 'lodash/object/defaults';
import omitBy from 'lodash/omitBy';
import QueryString from 'querystring' ;

/**
 * Internal dependencies
 */
import shortcodeUtils from 'lib/shortcode';

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

	getShortCodeAttributes() {
		const shortcode = shortcodeUtils.parse( this.props.content );
		const namedAttrs = shortcode.attrs.named;
		const defaultWidth = 640;
		const defaultHeight = defaultWidth * 9 / 16;

		return defaults( {
			videopress_guid: shortcode.attrs.numeric[0],
			w: parseInt( namedAttrs.w, 10 ) || undefined,
			h: parseInt( namedAttrs.h, 10 ) || undefined,
			autoplay: namedAttrs.autoplay === 'true',
			hd: namedAttrs.hd === 'true',
			loop: namedAttrs.loop === 'true',
			at: parseInt( namedAttrs.at, 10 ) || undefined,
			defaultLangCode: namedAttrs.defaultlangcode
		}, {
			w: defaultWidth,
			h: defaultHeight,
			at: 0,
			defaultLangCode: false
		} );
	}

	getEmbedUrl( attrs ) {
		const queryString = QueryString.stringify( omitBy( attrs, ['videopress_guid', 'w', 'h'] ) );

		return `https://videopress.com/embed/${ attrs.videopress_guid }?${ queryString }`;
	}

	render() {
		const attrs = this.getShortCodeAttributes();

		return (
			<div className="wpview-content">
				<iframe
					width = { attrs.w }
					height = { attrs.h }
					src={ this.getEmbedUrl( attrs ) }
					frameBorder="0"
					allowFullScreen />
			</div>
		);
	}

}

export default WpVideoView;
