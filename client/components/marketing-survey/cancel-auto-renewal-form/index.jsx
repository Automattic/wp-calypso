/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Dialog from 'components/dialog';
import Button from 'components/button';

class CancelAutoRenewalForm extends Component {
	onSubmit = () => {
		this.props.onClose();
	};

	closeDialog = () => {
		this.props.onClose();
	};

	render() {
		const { translate, isVisible } = this.props;

		return (
			<Dialog isVisible={ isVisible } onClose={ this.closeDialog }>
				<h2 className="cancel-auto-renewal-form__header">
					{ translate( 'Your thoughts are important for us.' ) }
				</h2>

				<Button onClick={ this.closeDialog }>{ translate( 'Skip' ) }</Button>
				<Button primary onClick={ this.onSubmit }>
					{ translate( 'Submit' ) }
				</Button>
			</Dialog>
		);
	}
}

export default connect()( localize( CancelAutoRenewalForm ) );
