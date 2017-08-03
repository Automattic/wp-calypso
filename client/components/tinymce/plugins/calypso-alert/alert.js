/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Dialog from 'components/dialog';
import FormButton from 'components/forms/form-button';

export default React.createClass( {
	displayName: 'Alert',

	propTypes: {
		isVisible: React.PropTypes.bool.isRequired,
		onClose: React.PropTypes.func.isRequired,
		message: React.PropTypes.string.isRequired,
	},

	splitMessage() {
		const lines = this.props.message.split( '\n\n' );
		return lines.map( ( line, i ) => <p key={ 'alert-' + i }>{ line }</p> );
	},

	getButtons() {
		return [
			<FormButton
				isPrimary={ false }
				aria-label={ this.translate( 'Dismiss alert message' ) }
				onClick={ this.props.onClose }
			>
				{ this.translate( 'OK' ) }
			</FormButton>
		];
	},

	render() {
		return (
			<Dialog
				isVisible={ this.props.isVisible }
				additionalClassNames="editor-alert-modal"
				onClose={ this.props.onClose }
				buttons={ this.getButtons() }
			>
				{ this.splitMessage() }
			</Dialog>
		);
	}
} );
