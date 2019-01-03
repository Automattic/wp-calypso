/**
 * External dependencies
 */
import { Component } from '@wordpress/element';
import { get } from 'lodash';
import { ClipboardButton, PanelBody, TextControl } from '@wordpress/components';
import { withSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import './editor.scss';
import { __, _x } from 'gutenberg/extensions/presets/jetpack/utils/i18n';

class ShortlinksPanel extends Component {
	state = {
		hasCopied: false,
	};

	onCopy = () => this.setState( { hasCopied: true } );

	onFinishCopy = () => this.setState( { hasCopied: false } );

	onFocus = event => event.target.select();

	render() {
		const { shortlink } = this.props;
		const { hasCopied } = this.state;

		if ( ! shortlink ) {
			return null;
		}

		return (
			<PanelBody title={ __( 'Shortlink' ) } className="jetpack-shortlinks__panel">
				<TextControl readOnly onFocus={ this.onFocus } value={ shortlink } />
				<ClipboardButton
					isDefault
					onCopy={ this.onCopy }
					onFinishCopy={ this.onFinishCopy }
					text={ shortlink }
				>
					{ hasCopied ? __( 'Copied!' ) : _x( 'Copy', 'verb' ) }
				</ClipboardButton>
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
