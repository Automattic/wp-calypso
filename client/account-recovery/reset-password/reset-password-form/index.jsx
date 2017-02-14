/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { identity } from 'lodash';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import Button from 'components/button';
import FormFieldset from 'components/forms/form-fieldset';
import FormLegend from 'components/forms/form-legend';
import ResetOptionSet from './reset-option-set';

import { getAccountRecoveryResetOptions } from 'state/selectors';

export class ResetPasswordFormComponent extends Component {
	static defaultProps = {
		translate: identity,
	};

	static propTypes = {
		translate: PropTypes.func.isRequired,
		resetOptions: PropTypes.array.isRequired,
	};

	state = {
		isSubmitting: false,
		selectedResetOption: null,
	};

	submitForm = () => {
		// TODO:
		// This is going to be replaced by corresponding redux actions.
		this.setState( { isSubmitting: true } );
	};

	onResetOptionChanged = ( event ) => {
		this.setState( { selectedResetOption: event.currentTarget.value } );
	};

	render() {
		const {
			resetOptions,
			translate
		} = this.props;

		const { isSubmitting, selectedResetOption } = this.state;
		const isPrimaryButtonEnabled = selectedResetOption && ! isSubmitting;

		return (
			<div className="reset-password-form">
				<h2 className="reset-password-form__title">
					{ translate( 'Reset your password' ) }
				</h2>
				<p>
					{ translate(
						'To reset your password and recover access to your account, ' +
						'select one of these options and follow the instructions.'
					) }
				</p>
				<Card>
					<FormFieldset className="reset-password-form__field-set">
						<FormLegend className="reset-password-form__legend">
							{ translate( 'How would you like to reset your password?' ) }
						</FormLegend>
						{ resetOptions.map( ( resetOption ) => (
							<ResetOptionSet
								email={ resetOption.email }
								sms={ resetOption.sms }
								name={ resetOption.name }
								onOptionChanged={ this.onResetOptionChanged }
								selectedResetOption={ selectedResetOption }
							/>
						) ) }
					</FormFieldset>
					<Button
						className="reset-password-form__submit-button"
						onClick={ this.submitForm }
						disabled={ ! isPrimaryButtonEnabled }
						primary>
						{ translate( 'Continue' ) }
					</Button>
				</Card>
			</div>
		);
	}
}

export default connect(
	( state ) => ( {
		resetOptions: getAccountRecoveryResetOptions( state ),
	} )
, localize( ResetPasswordFormComponent ) );
