/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import shortcodeUtils from 'lib/shortcode';
import Shortcode from 'components/shortcode';

var WpVideoView = React.createClass( {

	statics: {
		match( content ) {
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
		},

		serialize( content ) {
			return encodeURIComponent( content );
		}
	},

	render() {
		return (
			<div className="wpview-content wpview-type-wpvideo">
				<Shortcode siteId={ this.props.siteId }>
					{ this.props.content }
				</Shortcode>
			</div>
		);
	}

} );

export default WpVideoView;
