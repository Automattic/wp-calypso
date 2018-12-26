/**
 * External dependencies
 */
import { Component } from '@wordpress/element';
import { get } from 'lodash';
import { PanelBody, TextControl } from '@wordpress/components';
import { withSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { __ } from 'gutenberg/extensions/presets/jetpack/utils/i18n';

class ShortlinksPanel extends Component {
	onFocus = event => event.target.select();

	render() {
		const { shortlink } = this.props;

		if ( ! shortlink ) {
			return null;
		}

		return (
			<PanelBody title={ __( 'Shortlink' ) }>
				<TextControl readOnly onFocus={ this.onFocus } value={ shortlink } />
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
