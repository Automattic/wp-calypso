/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React, { Component, Fragment } from 'react';

/**
 * Internal dependencies
 */
import { Dialog } from '@automattic/components';
import FormSectionHeading from 'components/forms/form-section-heading';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormTextInput from 'components/forms/form-text-input';
import FormInputValidation from 'components/forms/form-input-validation';
import FormCheckbox from 'components/forms/form-checkbox';
import { MOVE_DOMAIN } from 'lib/url/support';
import { getName } from 'lib/purchases';

class RemoveDomainDialog extends Component {
	static propTypes = {
		isRemoving: PropTypes.bool.isRequired,
		isDialogVisible: PropTypes.bool.isRequired,
		removePurchase: PropTypes.func.isRequired,
		closeDialog: PropTypes.func.isRequired,
		purchase: PropTypes.object,
	};

	state = {
		step: 1,
		domainValidated: false,
		userAgreed: false,
		showErrors: false,
	};

	renderDomainDeletionWarning( productName ) {
		const { translate } = this.props;

		return (
			<p>
				{ translate(
					'Deleting {{strong}}%(domain)s{{/strong}} is {{strong}}permanent{{/strong}}. ' +
						'You will no longer own it, and it could be registered ' +
						'by someone else.',
					{
						args: { domain: productName },
						components: { strong: <strong /> },
					}
				) }
			</p>
		);
	}

	renderFirstStep( productName ) {
		const { translate } = this.props;

		return (
			<Fragment>
				<FormSectionHeading>
					{ translate( '{{strong}}Delete{{/strong}} %(domain)s and remove it from your account.', {
						args: { domain: productName },
						components: { strong: <strong /> },
					} ) }
				</FormSectionHeading>

				{ this.renderDomainDeletionWarning( productName ) }

				<p>
					{ translate( 'If you want to use this domain with another service, DO NOT delete it.' ) }{ ' ' }
					{ translate(
						'Instead, keep the domain. You can then {{a}}move or point your domain to a different service.{{/a}}',
						{
							components: {
								a: <a target="_blank" rel="noopener noreferrer" href={ MOVE_DOMAIN } />,
							},
						}
					) }
				</p>
			</Fragment>
		);
	}

	onDomainChange = ( event ) => {
		const productName = getName( this.props.purchase );
		this.setState( { domainValidated: event.currentTarget.value === productName } );
	};

	onAgreeChange = ( event ) => {
		this.setState( { userAgreed: event.target.checked } );
	};

	renderSecondStep( productName ) {
		const { translate } = this.props;

		return (
			<Fragment>
				<FormSectionHeading>
					{ translate(
						'{{strong}}Delete{{/strong}} this domain by typing “%(domain)s” into the field below:',
						{
							args: { domain: productName },
							components: { strong: <strong /> },
						}
					) }
				</FormSectionHeading>
				<FormFieldset>
					<FormLabel htmlFor="remove-domain-dialog__form-domain">
						{ translate( 'Type your domain name to proceed', { context: 'Domain name' } ) }
					</FormLabel>
					<FormTextInput
						name="domain"
						id="remove-domain-dialog__form-domain"
						isError={ this.state.showErrors && ! this.state.domainValidated }
						onChange={ this.onDomainChange }
					/>
					{ this.state.showErrors && ! this.state.domainValidated && (
						<FormInputValidation
							text={ translate( 'The domain name you entered does not match.' ) }
							isError
						/>
					) }
				</FormFieldset>
				<FormFieldset>
					<FormLabel>
						<FormCheckbox name="agree" value="true" onChange={ this.onAgreeChange } />
						<span>
							{ translate( 'I understand that this is permanent and irreversible.', {
								context: 'Domain name',
							} ) }
						</span>
					</FormLabel>

					{ this.state.showErrors && ! this.state.userAgreed && (
						<FormInputValidation
							text={ translate(
								"You need to confirm that you understand the action you're performing."
							) }
							isError
						/>
					) }
				</FormFieldset>

				{ this.renderDomainDeletionWarning( productName ) }
			</Fragment>
		);
	}

	nextStep = ( closeDialog ) => {
		if ( this.props.isRemoving ) {
			return;
		}
		switch ( this.state.step ) {
			case 1:
				this.setState( { step: 2 } );
				break;
			case 2:
				if ( this.state.domainValidated && this.state.userAgreed ) {
					this.props.removePurchase( closeDialog );
				} else {
					this.setState( { showErrors: true } );
				}
				break;
		}
	};

	close = () => {
		if ( this.props.isRemoving ) {
			return;
		}
		this.props.closeDialog();
		this.setState( { step: 1 } );
	};

	render() {
		const { purchase, translate, chatButton } = this.props;
		const productName = getName( purchase );
		const buttons = [
			{
				action: 'cancel',
				disabled: this.props.isRemoving,
				isPrimary: true,
				label: translate( 'Keep this Domain' ),
			},
			{
				action: 'remove',
				additionalClassNames: [ this.props.isRemoving ? 'is-busy' : '', 'is-scary' ],
				label: translate( 'Delete this Domain' ),
				onClick: this.nextStep,
			},
		];

		if ( chatButton ) {
			buttons.unshift( chatButton );
		}

		return (
			<Dialog
				buttons={ buttons }
				className="remove-domain-dialog__dialog"
				isVisible={ this.props.isDialogVisible }
				onClose={ this.close }
			>
				{ this.state.step === 1 && this.renderFirstStep( productName ) }
				{ this.state.step === 2 && this.renderSecondStep( productName ) }
			</Dialog>
		);
	}
}

export default localize( RemoveDomainDialog );
