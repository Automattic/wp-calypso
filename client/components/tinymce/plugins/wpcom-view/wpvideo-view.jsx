/**
 * External dependencies
 */
import React, { Component } from 'react';

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

	getEmbedUrl() {
		var videopress_guid = shortcodeUtils.parse( this.props.content ).attrs.numeric[0];
		return `https://videopress.com/embed/${ videopress_guid }`;
	}

	render() {
		return (
			<div className="wpview-content">
				<iframe
					src={ this.getEmbedUrl() }
					frameBorder="0"
					allowFullScreen />
			</div>
		);
	}

}

export default WpVideoView;
