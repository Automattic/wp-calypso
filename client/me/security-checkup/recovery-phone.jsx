/**
 * External dependencies
 */
import React from 'react';
import isEmpty from 'lodash/lang/isEmpty';

/**
 * Internal dependencies
 */
import AccountRecoveryStore from 'lib/security-checkup/account-recovery-store';
import SecurityCheckupActions from 'lib/security-checkup/actions';
import FormSectionHeading from 'components/forms/form-section-heading';
import FormButton from 'components/forms/form-button';

module.exports = React.createClass( {
	displayName: 'SecurityCheckupRecoveryPhone',

	componentDidMount: function() {
		AccountRecoveryStore.on( 'change', this.refreshRecoveryPhone );
	},

	componentWillUnmount: function() {
		AccountRecoveryStore.off( 'change', this.refreshRecoveryPhone );
	},

	getInitialState: function() {
		return {
			recoveryPhone: AccountRecoveryStore.getPhone(),
			isAddingRecoveryPhone: false,
			isSavingRecoveryPhone: false
		};
	},

	refreshRecoveryPhone: function() {
		this.setState( {
			recoveryPhone: AccountRecoveryStore.getPhone(),
			isSavingRecoveryPhone: AccountRecoveryStore.isSavingRecoveryPhone()
		} );
	},

	editPhone: function() {

	},

	renderRecoveryPhone: function() {
		if ( this.state.recoveryPhone.loading ) {
			return(
				<div>
					<FormSectionHeading>Recovery phone placeholder</FormSectionHeading>
				</div>
			);
		}

		if ( isEmpty( this.state.recoveryPhone.data ) ) {
			return(
				<div>
					<FormSectionHeading>Recovery phone</FormSectionHeading>
					<p>No recovery phone</p>
				</div>
			);
		}

		return (
			<div>
				<FormSectionHeading>Recovery phone</FormSectionHeading>
				<p>0775143910</p>
			</div>
		);
	},

	renderRecoveryPhoneActions: function() {
		return(
			<FormButton onClick={ this.editPhone } isPrimary={ false } >
				{ this.translate( 'Edit Phone' ) }
			</FormButton>
		);
	},

	render: function() {
		return (
			<div>
				{ this.renderRecoveryPhone() }
				{ this.renderRecoveryPhoneActions() }
			</div>
		);
	}
} );
