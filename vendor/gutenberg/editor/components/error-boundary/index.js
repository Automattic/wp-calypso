/**
 * External dependencies
 */
import { noop } from 'lodash';

/**
 * WordPress dependencies
 */
import { Component } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Button, ClipboardButton } from '@wordpress/components';

/**
 * Internal dependencies
 */
import { Warning } from '../';
import { getEditedPostContent } from '../../store/selectors';

class ErrorBoundary extends Component {
	constructor() {
		super( ...arguments );

		this.reboot = this.reboot.bind( this );
		this.getContent = this.getContent.bind( this );

		this.state = {
			error: null,
		};
	}

	componentDidCatch( error ) {
		this.setState( { error } );
	}

	reboot() {
		this.props.onError();
	}

	getContent() {
		try {
			return getEditedPostContent( this.context.store.getState() );
		} catch ( error ) {}
	}

	render() {
		const { error } = this.state;
		if ( ! error ) {
			return this.props.children;
		}

		return (
			<Warning
				actions={ [
					<Button key="recovery" onClick={ this.reboot } isLarge>
						{ __( 'Attempt Recovery' ) }
					</Button>,
					<ClipboardButton key="copy-post" text={ this.getContent } isLarge>
						{ __( 'Copy Post Text' ) }
					</ClipboardButton>,
					<ClipboardButton key="copy-error" text={ error.stack } isLarge>
						{ __( 'Copy Error' ) }
					</ClipboardButton>,
				] }
			>
				{ __( 'The editor has encountered an unexpected error.' ) }
			</Warning>
		);
	}
}

ErrorBoundary.contextTypes = {
	store: noop,
};

export default ErrorBoundary;
