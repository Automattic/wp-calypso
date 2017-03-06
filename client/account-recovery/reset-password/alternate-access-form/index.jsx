/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import { identity, noop } from 'lodash';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import support from 'lib/url/support';
import Card from 'components/card';
import Button from 'components/button';
import FormLabel from 'components/forms/form-label';
import FormInput from 'components/forms/form-text-input';

export class AlternateAccessFormComponent extends Component {
	static defaultProps = {
		translate: identity,
		label: '',
		description: '',
		onSkip: null,
		onContinue: noop,
	};

	state = {
		isSubmitting: false,
		fieldValue: '',
	}

	submitForm = () => {
		this.setState( { isSubmitting: true }, () => {
			this.props.onContinue( this.state.fieldValue );
		} );
	};

	onFieldChanged = ( event ) => {
		this.setState( { fieldValue: event.target.value } );
	};

	render() {
		const { translate, onSkip, label, description, className } = this.props;
		const { isSubmitting, fieldValue } = this.state;
		const isPrimaryButtonDisabled = ! fieldValue || isSubmitting;
		const classes = classnames( 'alternate-access-form', className, {
			'is-skippable': !! onSkip
		} );

		return (
			<div className={ classes }>
				<h2 className="alternate-access-form__title">
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
					<FormLabel
						className="alternate-access-form__field-label"
						htmlFor="alternate-access-form__field"
					>
						{ label }
					</FormLabel>
					<p className="alternate-access-form__field-description">
						{ description }
					</p>
					<FormInput
						id="alternate-access-form__field"
						className="alternate-access-form__field-input"
						onChange={ this.onFieldChanged }
						value={ fieldValue }
						disabled={ isSubmitting } />

					<Button
						className="alternate-access-form__continue-button"
						onClick={ this.submitForm }
						disabled={ isPrimaryButtonDisabled }
						primary
					>
						{ translate( 'Continue' ) }
					</Button>

					{
						onSkip &&
						<Button
							className="alternate-access-form__skip-button"
							onClick={ onSkip }
							disabled={ isSubmitting }
						>
							{ translate( 'Skip this question' ) }
						</Button>
					}
				</Card>
			</div>
		);
	}
}

export default localize( AlternateAccessFormComponent );
