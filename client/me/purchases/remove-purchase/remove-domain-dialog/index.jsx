import { Dialog } from '@automattic/components';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormInputValidation from 'calypso/components/forms/form-input-validation';
import FormLabel from 'calypso/components/forms/form-label';
import FormSectionHeading from 'calypso/components/forms/form-section-heading';
import FormTextInput from 'calypso/components/forms/form-text-input';
import { getSelectedDomain } from 'calypso/lib/domains';
import { getName } from 'calypso/lib/purchases';
import { getTitanProductName, hasTitanMailWithUs } from 'calypso/lib/titan';
import wpcom from 'calypso/lib/wp';
import {
	domainManagementTransferOut,
	domainManagementNameServers,
} from 'calypso/my-sites/domains/paths';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import { getDomainsBySiteId } from 'calypso/state/sites/domains/selectors';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';

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
					{ translate( '{{strong}}You are deleting %(domain)s from the web.{{/strong}}', {
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
				<p>
					{ translate(
						'This domain name will be deleted. Any services related to it will cease to function. Are you sure you wish to proceed?'
					) }
				</p>
			</Fragment>
		);
	}

	async isWpComEmailBasedOnDomain() {
		this.setState( {
			isCheckingEmail: true,
		} );

		const { purchase } = this.props;
		const productName = getName( purchase );
		const { email } = await wpcom.me().get();

		this.setState( {
			isCheckingEmail: false,
		} );

		return email.endsWith( productName );
	}

	nextStep = async ( closeDialog ) => {
		if ( this.props.isRemoving ) {
			return;
		}
		const isEmailBasedOnDomain = await this.isWpComEmailBasedOnDomain();
		switch ( this.state.step ) {
			case 1:
				this.setState( {
					step: isEmailBasedOnDomain ? 2 : 3,
				} );
				break;
			case 2:
				if ( isEmailBasedOnDomain ) break;
				this.setState( {
					step: 3,
				} );
				break;
			case 3:
				if ( isEmailBasedOnDomain ) {
					this.setState( { step: 2 } );
					break;
				}
				if ( this.state.domainValidated ) {
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
				label: translate( 'Never Mind' ),
			},
			{
				action: 'remove',
				additionalClassNames: [
					this.props.isRemoving || this.state.isCheckingEmail ? 'is-busy' : '',
					'is-scary',
				],
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
		hasTitanWithUs: hasTitanMailWithUs( selectedDomain ),
		currentRoute: getCurrentRoute( state ),
		slug: getSelectedSiteSlug( state ),
	};
} )( localize( RemoveDomainDialog ) );
