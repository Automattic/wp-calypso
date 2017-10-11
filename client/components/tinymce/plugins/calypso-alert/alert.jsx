/**
 * External dependencies
 *
 * @format
 */

import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import React from 'react';

/**
 * Internal dependencies
 */
import Dialog from 'components/dialog';
import FormButton from 'components/forms/form-button';

export default localize(
	React.createClass( {
		displayName: 'Alert',

		propTypes: {
			isVisible: PropTypes.bool.isRequired,
			onClose: PropTypes.func.isRequired,
			message: PropTypes.string.isRequired,
		},

		splitMessage() {
			const lines = this.props.message.split( '\n\n' );
			return lines.map( ( line, i ) => <p key={ 'alert-' + i }>{ line }</p> );
		},

		getButtons() {
			return [
				<FormButton
					isPrimary={ false }
					aria-label={ this.props.translate( 'Dismiss alert message' ) }
					onClick={ this.props.onClose }
				>
					{ this.props.translate( 'OK' ) }
				</FormButton>,
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
		},
	} )
);
