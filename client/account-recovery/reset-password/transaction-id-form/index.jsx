/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import { identity } from 'lodash';

/**
 * Internal dependencies
 */
import support from 'lib/url/support';
import Card from 'components/card';
import Button from 'components/button';
import FormLabel from 'components/forms/form-label';
import FormInput from 'components/forms/form-text-input';

export class TransactionIdFormComponent extends Component {
	static defaultProps = {
		translate: identity,
	};

	state = {
		isSubmitting: false,
		transactionId: '',
	}

	submitForm = () => {
		this.setState( { isSubmitting: true } );
	};

	onTransactionIdChanged = ( event ) => {
		this.setState( { transactionId: event.target.value } );
	};

	render() {
		const { translate } = this.props;
		const { isSubmitting, transactionId } = this.state;
		const isPrimaryButtonDisabled = ! transactionId || isSubmitting;

		return (
			<div>
				<h2 className="transaction-id-form__title">
					{ translate( 'Account recovery' ) }
				</h2>
				<p>
					{ translate(
						'Please provide the following information to verify your identity. ' +
						'Without {{strong}}proper validating information{{/strong}}, ' +
						'we might not be able to help you recover your account. ' +
						'Read more about the process {{helpLink}}here{{/helpLink}}.',
						{
							components: {
								strong: <strong />,
								helpLink: <a href={ support.ACCOUNT_RECOVERY } />
							}
						}
					) }
				</p>
				<Card>
					<FormLabel htmlFor="transactionId">
						{ translate( 'Transaction ID' ) }
					</FormLabel>
					<p className="transaction-id-form__transaction-id-description">
						{ translate(
							'If you have purchased any upgrades on WordPress.com, this number ' +
							'will be in your receipt from PayPal or in your PayPal account. ' +
							'{{helpLink}}Need help to find your transaction id?{{/helpLink}}',
							{
								components: {
									helpLink: <a href={ support.ACCOUNT_RECOVERY } />
								}
							}
						) }
					</p>
					<FormInput
						id="transactionId"
						className="transaction-id-form__transaction-id-input"
						onChange={ this.onTransactionIdChanged }
						value={ transactionId }
						disabled={ isSubmitting } />

					<Button
						className="transaction-id-form__continue-button"
						onClick={ this.submitForm }
						disabled={ isPrimaryButtonDisabled }
						primary
					>
						{ translate( 'Continue' ) }
					</Button>

					<Button
						className="transaction-id-form__skip-button"
						onClick={ this.skip }
						disabled={ isSubmitting }
					>
						{ translate( 'Skip this question' ) }
					</Button>
				</Card>
			</div>
		);
	}
}

export default localize( TransactionIdFormComponent );
