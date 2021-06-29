/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { Dialog } from '@automattic/components';
import {
	domainManagementTransferOut,
	domainManagementNameServers,
} from 'calypso/my-sites/domains/paths';
import FormSectionHeading from 'calypso/components/forms/form-section-heading';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLabel from 'calypso/components/forms/form-label';
import FormTextInput from 'calypso/components/forms/form-text-input';
import FormInputValidation from 'calypso/components/forms/form-input-validation';
import { getName } from 'calypso/lib/purchases';
import { getDomainsBySiteId } from 'calypso/state/sites/domains/selectors';
import { getSelectedDomain } from 'calypso/lib/domains';
import { getTitanProductName, hasTitanMailWithUs } from 'calypso/lib/titan';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';

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
		const { translate, hasTitanWithUs, slug, currentRoute } = this.props;

		return (
			<Fragment>
				<p>
					{ translate(
						'This will stop all services connected to %(domain)s including your email and website. ' +
							'If you wish to use %(domain)s with another service or provider you can:',
						{
							args: { domain: productName },
						}
					) }
				</p>
				<ul>
					<li>
						<a href={ domainManagementNameServers( slug, productName, currentRoute ) }>
							{ translate( 'Point %(domain)s to another service', {
								args: { domain: productName },
							} ) }
						</a>
					</li>
					<li>
						<a href={ domainManagementTransferOut( slug, productName, currentRoute ) }>
							{ translate( 'Move %(domain)s to another provider', {
								args: { domain: productName },
							} ) }
						</a>
					</li>
				</ul>
				<p>
					{ hasTitanWithUs &&
						' ' +
							translate(
								'You also have an active %(productName)s subscription for this domain, and your emails will stop ' +
									'working if you delete your domain.',
								{
									args: {
										productName: getTitanProductName(),
									},
									comment:
										'%(productName) is the name of the product, which should be "Professional Email" translated',
								}
							) }
				</p>
			</Fragment>
		);
	}

	renderFirstStep( productName ) {
		const { translate } = this.props;

		return (
			<Fragment>
				<FormSectionHeading>
					{ translate( 'You are deleting {{strong}}%(domain)s{{/strong}} from the web.', {
						args: { domain: productName },
						components: { strong: <strong /> },
					} ) }
				</FormSectionHeading>

				{ this.renderDomainDeletionWarning( productName ) }
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
					{ translate( '{{strong}}Confirm your decision{{/strong}}', {
						args: { domain: productName },
						components: { strong: <strong /> },
					} ) }
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
				{ /* <FormFieldset>
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
				</FormFieldset> */ }

				<p>
					{ translate(
						'We will delete the domain name. Any services related to the domain will cease to function. Be sure you wish to proceed.'
					) }
				</p>
				{ /* { this.renderDomainDeletionWarning( productName ) } */ }
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
				label: translate( 'Nevermind' ),
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

export default connect( ( state, ownProps ) => {
	const domains = getDomainsBySiteId( state, ownProps.purchase.siteId );
	const selectedDomainName = getName( ownProps.purchase );
	const selectedDomain = getSelectedDomain( { domains, selectedDomainName } );
	return {
		hasTitanWithUs: hasTitanMailWithUs( selectedDomain ),
		currentRoute: getCurrentRoute( state ),
		slug: getSelectedSiteSlug( state ),
	};
} )( localize( RemoveDomainDialog ) );
