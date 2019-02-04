/**
 * External dependencies
 */
import { Component } from '@wordpress/element';
import { get } from 'lodash';
import { PanelBody } from '@wordpress/components';
import { withSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import ClipboardInput from 'gutenberg/extensions/presets/jetpack/utils/clipboard-input';
import { __ } from 'gutenberg/extensions/presets/jetpack/utils/i18n';

class ShortlinksPanel extends Component {
	render() {
		const { shortlink } = this.props;

		if ( ! shortlink ) {
			return null;
		}

		return (
			<PanelBody title={ __( 'Shortlink' ) } className="jetpack-shortlinks__panel">
				<ClipboardInput link={ shortlink } />
			</PanelBody>
		);
	}
}

export default withSelect( select => {
	const currentPost = select( 'core/editor' ).getCurrentPost();
	return {
		shortlink: get( currentPost, 'jetpack_shortlink', '' ),
	};
} )( ShortlinksPanel );
