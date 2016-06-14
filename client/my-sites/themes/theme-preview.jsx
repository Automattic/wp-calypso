/** @ssr-ready **/

/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import WebPreview from 'components/web-preview';
import { getPreviewUrl } from './helpers';

export default React.createClass( {
	displayName: 'ThemePreview',

	propTypes: {
		theme: React.PropTypes.object,
		showPreview: React.PropTypes.bool,
		onClose: React.PropTypes.func,
	},

	render() {
		const previewUrl = getPreviewUrl( this.props.theme );

		return(
			<WebPreview showPreview={ this.props.showPreview }
				onClose={ this.props.onClose }
				previewUrl={ previewUrl }
				externalUrl={ this.props.theme.demo_uri } >
				{ this.props.children }
			</WebPreview>
		);
	}
} );
