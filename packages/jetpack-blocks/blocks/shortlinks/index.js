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
import JetpackPluginSidebar from 'gutenberg/extensions/presets/jetpack/editor-shared/jetpack-plugin-sidebar';
import { __ } from 'gutenberg/extensions/presets/jetpack/utils/i18n';

export const name = 'shortlinks';

export const settings = {
	render: () => <Shortlinks />,
};

class ShortlinksPanel extends Component {
	render() {
		const { shortlink } = this.props;

		if ( ! shortlink ) {
			return null;
		}

		return (
			<JetpackPluginSidebar>
				<PanelBody title={ __( 'Shortlink' ) } className="jetpack-shortlinks__panel">
					<ClipboardInput link={ shortlink } />
				</PanelBody>
			</JetpackPluginSidebar>
		);
	}
}

const Shortlinks = withSelect( select => {
	const currentPost = select( 'core/editor' ).getCurrentPost();
	return {
		shortlink: get( currentPost, 'jetpack_shortlink', '' ),
	};
} )( ShortlinksPanel );
