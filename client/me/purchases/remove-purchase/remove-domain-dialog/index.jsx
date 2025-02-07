import { Dialog, FormLabel } from '@automattic/components';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormSectionHeading from 'calypso/components/forms/form-section-heading';
import FormTextInput from 'calypso/components/forms/form-text-input';
import { getSelectedDomain } from 'calypso/lib/domains';
import { getName } from 'calypso/lib/purchases';
import { hasTitanMailWithUs } from 'calypso/lib/titan';
import { domainManagementEdit, domainManagementTransferOut } from 'calypso/my-sites/domains/paths';
import { getCurrentUserEmail } from 'calypso/state/current-user/selectors';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import { getDomainsBySiteId } from 'calypso/state/sites/domains/selectors';
import { getSiteSlug } from 'calypso/state/sites/selectors';

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
	};

	renderDomainDeletionWarning( productName ) {
		const { translate, slug, currentRoute, isGravatarRestrictedDomain } = this.props;

		return (
			<Fragment>
				<p>
					{ translate(
						'Deleting a domain will make all services connected to it unreachable, including your email and website. It will also make the domain available for someone else to register.'
					) }
				</p>
				{ isGravatarRestrictedDomain && (
					<p>
						{ translate(
							'This domain is provided at no cost for the first year for use with your Gravatar profile. This offer is limited to one free domain per user. If you cancel this domain, you will have to pay the standard price to register another domain for your Gravatar profile.'
						) }
					</p>
				) }
				<p>
					{ translate(
						'If you want to use {{strong}}%(domain)s{{/strong}} with another provider you can {{moveAnchor}}move it to another service{{/moveAnchor}} or {{transferAnchor}}transfer it to another provider{{/transferAnchor}}.',
						{
							args: { domain: productName },
							components: {
								strong: <strong />,
								moveAnchor: <a href={ domainManagementEdit( slug, productName, currentRoute ) } />,
								transferAnchor: (
									<a href={ domainManagementTransferOut( slug, productName, currentRoute ) } />
								),
							},
						}
					) }
				</p>
				<p>{ translate( 'Do you still want to continue with deleting your domain?' ) }</p>
			</Fragment>
		);
	}

	renderFirstStep( productName ) {
		const { translate } = this.props;

		return (
			<Fragment>
				<FormSectionHeading>
					{ translate( '{{strong}}Delete %(domain)s{{/strong}}', {
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

	renderUpdateEmailStep() {
		const { translate } = this.props;

		return (
			<Fragment>
				<FormSectionHeading>
					{ translate( '{{strong}}Update your WordPress.com email address{{/strong}}', {
						components: { strong: <strong /> },
					} ) }
				</FormSectionHeading>

				<p>
					{ translate(
						'You are deleting a domain name used in the email address we have on file for you. ' +
							'You must update your contact information.'
					) }
				</p>

				<p>
					{ translate(
						'You must visit your {{a}}Account Settings{{/a}} to update your email address before proceeding.',
						{
							components: { a: <a href="/me/account" /> },
						}
					) }
				</p>
			</Fragment>
		);
	}

	renderFinalStep( productName ) {
		const { translate } = this.props;

		return (
			<Fragment>
				<FormSectionHeading>
					{ translate( '{{strong}}Confirm your decision{{/strong}}', {
						args: { domain: productName },
						components: { strong: <strong /> },
					} ) }
				</FormSectionHeading>
				<p>
					{ translate(
						'{{strong}}%(domain)s{{/strong}} will be deleted. Any services related to it will stop working. Are you sure you want to proceed?',
						{
							args: { domain: productName },
							components: { strong: <strong /> },
						}
					) }
				</p>
				<FormFieldset>
					<FormLabel htmlFor="remove-domain-dialog__form-domain">
						{ translate( 'Type your domain name to proceed', { context: 'Domain name' } ) }
					</FormLabel>
					<FormTextInput
						name="domain"
						id="remove-domain-dialog__form-domain"
						onChange={ this.onDomainChange }
					/>
				</FormFieldset>
			</Fragment>
		);
	}

	nextStep = ( closeDialog ) => {
		if ( this.props.isRemoving ) {
			return;
		}

		const productName = getName( this.props.purchase );
		const isEmailBasedOnDomain = this.props.userEmail.endsWith( productName );

		switch ( this.state.step ) {
			case 1:
				this.setState( { step: isEmailBasedOnDomain ? 2 : 3 } );
				break;
			case 2:
				this.setState( { step: 3 } );
				break;
			case 3:
				this.props.removePurchase( closeDialog );
				break;
		}
	};

	close = () => {
		if ( this.props.isRemoving ) {
			return;
		}
		this.props.closeDialog();
		this.setState( { domainValidated: false, step: 1 } );
	};

	render() {
		const { purchase, translate, chatButton } = this.props;
		const productName = getName( purchase );

		const buttons = [
			{
				action: 'cancel',
				disabled: this.props.isRemoving,
				label: this.state.step === 3 ? translate( 'Never mind' ) : translate( 'Cancel' ),
			},
			...( this.state.step !== 2
				? [
						{
							action: 'remove',
							additionalClassNames: [
								this.props.isRemoving ? 'is-busy' : '',
								this.state.step === 3 ? 'is-scary' : '',
								'dialog__button--domains-remove',
							],
							isPrimary: true,
							disabled: this.state.step === 3 && ! this.state.domainValidated,
							label:
								this.state.step === 3 ? translate( 'Delete this domain' ) : translate( 'Continue' ),
							onClick: this.nextStep,
						},
				  ]
				: [] ),
		];

		if ( ! purchase ) {
			return;
		}

		if ( chatButton ) {
			buttons.unshift( chatButton );
		}

		return (
			<Dialog
				buttons={ buttons }
				additionalClassNames="remove-domain-dialog"
				isVisible={ this.props.isDialogVisible }
				onClose={ this.close }
				leaveTimeout={ 0 }
			>
				{ this.state.step === 1 && this.renderFirstStep( productName ) }
				{ this.state.step === 2 && this.renderUpdateEmailStep( productName ) }
				{ this.state.step === 3 && this.renderFinalStep( productName ) }
			</Dialog>
		);
	}
}

export default connect( ( state, ownProps ) => {
	const domains = getDomainsBySiteId( state, ownProps.purchase.siteId );
	const selectedDomainName = getName( ownProps.purchase );
	const selectedDomain = getSelectedDomain( { domains, selectedDomainName } );
	return {
		isGravatarRestrictedDomain: selectedDomain?.isGravatarRestrictedDomain,
		hasTitanWithUs: hasTitanMailWithUs( selectedDomain ),
		currentRoute: getCurrentRoute( state ),
		userEmail: getCurrentUserEmail( state ),
		slug: getSiteSlug( state, ownProps.purchase.siteId ),
	};
} )( localize( RemoveDomainDialog ) );
