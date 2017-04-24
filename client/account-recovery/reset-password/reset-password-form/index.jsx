/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import Button from 'components/button';
import FormFieldset from 'components/forms/form-fieldset';
import FormLegend from 'components/forms/form-legend';
import ResetOptionSet from './reset-option-set';
import ErrorMessage from 'account-recovery/components/account-recovery-error-message';

import {
	pickResetMethod,
	requestReset,
} from 'state/account-recovery/reset/actions';

import {
	getAccountRecoveryResetUserData,
	getAccountRecoveryResetOptions,
	getAccountRecoveryResetSelectedMethod,
	getAccountRecoveryResetRequestError,
	isRequestingAccountRecoveryReset,
} from 'state/selectors';

export class ResetPasswordFormComponent extends Component {
	static propTypes = {
		translate: PropTypes.func.isRequired,
		resetOptions: PropTypes.array.isRequired,
		selectedMethod: PropTypes.string,
		userData: PropTypes.object.isRequired,
		requestError: PropTypes.object,
		isRequesting: PropTypes.bool,
	};

	submitForm = () => {
		this.props.requestReset( {
			...this.props.userData,
			method: this.props.selectedMethod,
		} );
	};

	onResetOptionChanged = ( event ) => {
		this.props.pickResetMethod( event.currentTarget.value );
	};

	getOptionDisplayStrings = ( optionName ) => {
		const { translate } = this.props;

		switch ( optionName ) {
			case 'primary':
				return {
					email: translate(
						'Email a reset link to {{strong}}your main email address{{/strong}}.',
						{ components: { strong: <strong /> } }
					),
					sms: translate(
						'Send a reset code to {{strong}}your main phone{{/strong}}.',
						{ components: { strong: <strong /> } }
					),
				};
			case 'secondary':
				return {
					email: translate(
						'Email a reset link to {{strong}}your recovery email address{{/strong}}.',
						{ components: { strong: <strong /> } }
					),
					sms: translate(
						'Send a reset code to {{strong}}your recovery phone{{/strong}}.',
						{ components: { strong: <strong /> } }
					),
				};
			default:
				return {};
		}
	};

	render() {
		const {
			resetOptions,
			selectedMethod,
			isRequesting,
			requestError,
			translate,
		} = this.props;

		const isPrimaryButtonEnabled = selectedMethod && ! isRequesting;

		return (
			<Card>
				<h2 className="reset-password-form__title">
					{ translate( 'Reset your password' ) }
				</h2>
				<p>
					{ translate(
						'To reset your password and recover access to your account, ' +
						'select one of these options and follow the instructions.'
					) }
				</p>
				<FormFieldset className="reset-password-form__field-set">
					<FormLegend className="reset-password-form__legend">
						{ translate( 'How would you like to reset your password?' ) }
					</FormLegend>
					{ resetOptions.map( ( { email, sms, name }, index ) => (
						<ResetOptionSet
							key={ index }
							email={ email }
							sms={ sms }
							name={ name }
							displayStrings={ this.getOptionDisplayStrings( name ) }
							disabled={ isRequesting }
							onOptionChanged={ this.onResetOptionChanged }
							selectedResetOption={ selectedMethod }
						/>
					) ) }
				</FormFieldset>
				{ requestError && <ErrorMessage /> }
				<Button
					className="reset-password-form__submit-button"
					onClick={ this.submitForm }
					disabled={ ! isPrimaryButtonEnabled }
					primary>
					{ translate( 'Continue' ) }
				</Button>
			</Card>
		);
	}
}

export default connect(
	( state ) => ( {
		resetOptions: getAccountRecoveryResetOptions( state ),
		selectedMethod: getAccountRecoveryResetSelectedMethod( state ),
		userData: getAccountRecoveryResetUserData( state ),
		requestError: getAccountRecoveryResetRequestError( state ),
		isRequesting: isRequestingAccountRecoveryReset( state ),
	} ),
	{
		pickResetMethod,
		requestReset,
	}
)( localize( ResetPasswordFormComponent ) );
