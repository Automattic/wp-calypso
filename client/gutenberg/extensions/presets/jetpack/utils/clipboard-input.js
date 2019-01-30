/**
 * External dependencies
 */
import { Component, Fragment } from '@wordpress/element';
import { ClipboardButton, TextControl } from '@wordpress/components';

/**
 * Internal dependencies
 */
import { __, _x } from 'gutenberg/extensions/presets/jetpack/utils/i18n';

class ClipboardInput extends Component {
	state = {
		hasCopied: false,
	};

	onCopy = () => this.setState( { hasCopied: true } );

	onFinishCopy = () => this.setState( { hasCopied: false } );

	onFocus = event => event.target.select();

	render() {
		const { link } = this.props;
		const { hasCopied } = this.state;

		if ( ! link ) {
			return null;
		}

		return (
			<Fragment>
				<TextControl readOnly onFocus={ this.onFocus } value={ link } />
				<ClipboardButton
					isDefault
					onCopy={ this.onCopy }
					onFinishCopy={ this.onFinishCopy }
					text={ link }
				>
					{ hasCopied ? __( 'Copied!' ) : _x( 'Copy', 'verb' ) }
				</ClipboardButton>
			</Fragment>
		);
	}
}

export default ClipboardInput;
