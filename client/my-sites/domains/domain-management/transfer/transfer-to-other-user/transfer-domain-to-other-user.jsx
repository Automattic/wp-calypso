import page from '@automattic/calypso-router';
import { Dialog, Gridicon } from '@automattic/components';
import { createHigherOrderComponent } from '@wordpress/compose';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component, Fragment } from 'react';
import { connect, useSelector } from 'react-redux';
import FormButton from 'calypso/components/forms/form-button';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormSelect from 'calypso/components/forms/form-select';
import Main from 'calypso/components/main';
import useUsersQuery from 'calypso/data/users/use-users-query';
import BodySectionCssClass from 'calypso/layout/body-section-css-class';
import { getSelectedDomain, isMappedDomain } from 'calypso/lib/domains';
import { hasGSuiteWithUs } from 'calypso/lib/gsuite';
import { hasTitanMailWithUs } from 'calypso/lib/titan';
import wpcom from 'calypso/lib/wp';
import DesignatedAgentNotice from 'calypso/my-sites/domains/domain-management/components/designated-agent-notice';
import AftermarketAuctionNotice from 'calypso/my-sites/domains/domain-management/components/domain/aftermarket-auction-notice';
import HundredYearDomainNotTransferrableNotice from 'calypso/my-sites/domains/domain-management/components/domain/hundred-year-domain-not-transferrable-notice';
import DomainMainPlaceholder from 'calypso/my-sites/domains/domain-management/components/domain/main-placeholder';
import NonOwnerCard from 'calypso/my-sites/domains/domain-management/components/domain/non-owner-card';
import NonTransferrableDomainNotice from 'calypso/my-sites/domains/domain-management/components/domain/non-transferrable-domain-notice';
import DomainHeader from 'calypso/my-sites/domains/domain-management/components/domain-header';
import {
	domainManagementEdit,
	domainManagementList,
	domainManagementTransfer,
	isUnderDomainManagementAll,
} from 'calypso/my-sites/domains/paths';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';
import { successNotice, errorNotice } from 'calypso/state/notices/actions';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import { hasLoadedSiteDomains } from 'calypso/state/sites/domains/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import TransferUnavailableNotice from '../transfer-unavailable-notice';

import './style.scss';

const getWpcomUserId = ( user ) => user.linked_user_ID ?? user.ID;

class TransferDomainToOtherUser extends Component {
	static propTypes = {
		currentUserId: PropTypes.number.isRequired,
		domains: PropTypes.array.isRequired,
		isRequestingSiteDomains: PropTypes.bool.isRequired,
		selectedDomainName: PropTypes.string.isRequired,
		selectedSite: PropTypes.oneOfType( [ PropTypes.object, PropTypes.bool ] ).isRequired,
		// From `withUsers` HoC
		users: PropTypes.array.isRequired,
	};

	constructor( props ) {
		super( props );

		this.state = {
			selectedUserId: '',
			showConfirmationDialog: false,
			disableDialogButtons: false,
		};

		this.handleUserChange = this.handleUserChange.bind( this );
		this.handleTransferDomain = this.handleTransferDomain.bind( this );
		this.handleDialogClose = this.handleDialogClose.bind( this );
		this.handleConfirmTransferDomain = this.handleConfirmTransferDomain.bind( this );
	}

	handleUserChange( event ) {
		event.preventDefault();

		this.setState( { selectedUserId: event.target.value } );
	}

	handleTransferDomain() {
		this.setState( { showConfirmationDialog: true } );
	}

	handleTransferCancel = () => {
		const { selectedSite, selectedDomainName, currentRoute } = this.props;
		page( domainManagementTransfer( selectedSite?.slug, selectedDomainName, currentRoute ) );
	};

	handleConfirmTransferDomain( closeDialog ) {
		const { selectedDomainName, selectedSite } = this.props;
		const { selectedUserId } = this.state;
		const selectedUserDisplay = this.getSelectedUserDisplayName();
		const successMessage = this.props.translate(
			'%(selectedDomainName)s has been transferred to %(selectedUserDisplay)s',
			{ args: { selectedDomainName, selectedUserDisplay } }
		);
		const defaultErrorMessage = this.props.translate(
			'Failed to transfer %(selectedDomainName)s, please try again or contact support.',
			{ args: { selectedDomainName } }
		);

		this.setState( { disableDialogButtons: true } );
		wpcom.req
			.post(
				`/sites/${ selectedSite?.ID }/domains/${ selectedDomainName }/transfer-to-user/${ selectedUserId }`
			)
			.then(
				() => {
					this.setState( { disableDialogButtons: false } );
					this.props.successNotice( successMessage, { duration: 4000, isPersistent: true } );
					closeDialog();
					page(
						domainManagementEdit(
							this.props.selectedSite?.slug,
							this.props.selectedDomainName,
							this.props.currentRoute
						)
					);
				},
				( err ) => {
					this.setState( { disableDialogButtons: false } );
					this.props.errorNotice( err.message || defaultErrorMessage );
					closeDialog();
				}
			);
	}

	handleDialogClose() {
		if ( ! this.state.disableDialogButtons ) {
			this.setState( { showConfirmationDialog: false } );
		}
	}

	getSelectedUserDisplayName() {
		const selectedUser = this.props.users.find(
			( user ) => getWpcomUserId( user ) === Number( this.state.selectedUserId )
		);

		if ( ! selectedUser ) {
			return '';
		}

		return this.getUserDisplayName( selectedUser );
	}

	getUserDisplayName( { first_name, last_name, nice_name } ) {
		return first_name && last_name ? `${ first_name } ${ last_name } (${ nice_name })` : nice_name;
	}

	renderHeader() {
		const { translate, selectedSite, selectedDomainName, currentRoute } = this.props;

		const items = [
			{
				label: isUnderDomainManagementAll( currentRoute )
					? translate( 'All Domains' )
					: translate( 'Domains' ),
				href: domainManagementList(
					selectedSite?.slug,
					selectedDomainName,
					selectedSite?.options?.is_domain_only
				),
			},
			{
				label: selectedDomainName,
				href: domainManagementEdit( selectedSite?.slug, selectedDomainName, currentRoute ),
			},
			{
				label: translate( 'Transfer' ),
				href: domainManagementTransfer( selectedSite?.slug, selectedDomainName, currentRoute ),
			},
			{ label: translate( 'Transfer to another user' ) },
		];

		const mobileItem = {
			label: translate( 'Back to Transfer' ),
			href: domainManagementTransfer( selectedSite?.slug, selectedDomainName, currentRoute ),
			showBackArrow: true,
		};

		return <DomainHeader items={ items } mobileItem={ mobileItem } />;
	}

	render() {
		if ( ! this.isDataReady() ) {
			return (
				<>
					<BodySectionCssClass bodyClass={ [ 'transfer-to-other-user' ] } />
					<DomainMainPlaceholder goBack={ this.goToEdit } />
				</>
			);
		}
		return (
			<Main wideLayout>
				<BodySectionCssClass bodyClass={ [ 'transfer-to-other-user' ] } />
				{ this.renderHeader() }
				<div className="transfer-to-other-user__container">
					<div className="transfer-to-other-user__main">{ this.renderSection() }</div>
				</div>
			</Main>
		);
	}

	renderDialog() {
		const buttons = [
			{
				action: 'cancel',
				label: this.props.translate( 'Cancel' ),
				disabled: this.state.disableDialogButtons,
			},
			{
				action: 'confirm',
				label: this.props.translate( 'Confirm transfer' ),
				onClick: this.handleConfirmTransferDomain,
				disabled: this.state.disableDialogButtons,
				isPrimary: true,
			},
		];
		return (
			<Dialog
				className="transfer-to-other-user__confirmation-dialog"
				isVisible={ this.state.showConfirmationDialog }
				buttons={ buttons }
				onClose={ this.handleDialogClose }
			>
				<h1>{ this.props.translate( 'Confirm Transfer' ) }</h1>
				<p>{ this.getDialogMessage() }</p>
			</Dialog>
		);
	}

	getDialogMessage() {
		const { selectedDomainName: domainName, isMapping, translate } = this.props;
		const selectedUserDisplay = this.getSelectedUserDisplayName();

		if ( isMapping ) {
			return translate(
				'Do you want to transfer the domain connection of {{strong}}%(domainName)s{{/strong}} ' +
					'to {{strong}}%(selectedUserDisplay)s{{/strong}}?',
				{
					args: { domainName, selectedUserDisplay },
					components: { strong: <strong /> },
				}
			);
		}

		return translate(
			'Do you want to transfer the ownership of {{strong}}%(domainName)s{{/strong}} ' +
				'to {{strong}}%(selectedUserDisplay)s{{/strong}}?',
			{
				args: { domainName, selectedUserDisplay },
				components: { strong: <strong /> },
			}
		);
	}

	renderSection() {
		const {
			currentUserCanManage,
			domainRegistrationAgreementUrl,
			aftermarketAuction,
			isRedeemable,
		} = getSelectedDomain( this.props );
		const { domains, selectedDomainName, translate } = this.props;
		const selectedDomain = domains.find( ( domain ) => selectedDomainName === domain.name );

		if ( ! currentUserCanManage ) {
			return <NonOwnerCard domains={ domains } selectedDomainName={ selectedDomainName } />;
		}

		if ( selectedDomain?.isHundredYearDomain ) {
			return <HundredYearDomainNotTransferrableNotice />;
		}

		if ( aftermarketAuction ) {
			return <AftermarketAuctionNotice domainName={ selectedDomainName } />;
		}

		if ( isRedeemable ) {
			return <NonTransferrableDomainNotice domainName={ selectedDomainName } />;
		}

		if ( selectedDomain?.pendingRegistration || selectedDomain?.pendingRegistrationAtRegistry ) {
			return (
				<TransferUnavailableNotice
					message={ translate(
						'We are still setting up your domain. You will not be able to transfer it until the registration setup is done.'
					) }
				></TransferUnavailableNotice>
			);
		}

		const { isMapping, users } = this.props;
		const availableUsers = this.filterAvailableUsers( users );
		const saveButtonLabel = isMapping
			? translate( 'Transfer domain connection' )
			: translate( 'Transfer domain' );

		const hasEmailWithUs =
			hasTitanMailWithUs( selectedDomain ) || hasGSuiteWithUs( selectedDomain );

		return (
			<>
				{ this.renderTransferInformation() }
				<FormFieldset>
					<FormSelect
						disabled={ availableUsers.length === 0 }
						className="transfer-to-other-user__select"
						onChange={ this.handleUserChange }
						value={ this.state.selectedUserId }
					>
						{ availableUsers.length ? (
							<Fragment>
								<option value="">{ translate( 'Choose an administrator on this site' ) }</option>
								{ availableUsers.map( ( user ) => {
									const userId = getWpcomUserId( user );

									return (
										<option key={ userId } value={ userId }>
											{ this.getUserDisplayName( user ) }
										</option>
									);
								} ) }
							</Fragment>
						) : (
							<option value="">{ translate( '-- Site has no other administrators --' ) }</option>
						) }
					</FormSelect>
				</FormFieldset>
				{ hasEmailWithUs && (
					<div className="transfer-to-other-user__notice">
						<Gridicon icon="info-outline" size={ 18 } />
						<p className="transfer-to-other-user__notice-copy">
							{ translate(
								'The email subscription for %(domainName)s will be transferred along with the domain.',
								{ args: { domainName: selectedDomainName } }
							) }
						</p>
					</div>
				) }
				{ ! isMapping && (
					<DesignatedAgentNotice
						domainRegistrationAgreementUrl={ domainRegistrationAgreementUrl }
						saveButtonLabel={ saveButtonLabel }
					/>
				) }
				<FormButton disabled={ ! this.state.selectedUserId } onClick={ this.handleTransferDomain }>
					{ saveButtonLabel }
				</FormButton>
				<FormButton isPrimary={ false } onClick={ this.handleTransferCancel }>
					{ translate( 'Cancel' ) }
				</FormButton>
				{ this.renderDialog() }
			</>
		);
	}

	renderTransferInformation() {
		const { isMapping, selectedDomainName: domainName, selectedSite, translate } = this.props;

		if ( isMapping ) {
			return (
				<>
					<p>
						{ translate(
							'Please choose an administrator to transfer domain connection of {{strong}}%(domainName)s{{/strong}} to.',
							{ args: { domainName }, components: { strong: <strong /> } }
						) }
					</p>
					<p>
						{ translate(
							'You can transfer this domain connection to any administrator on this site. If the user you want to ' +
								'transfer is not currently an administrator, please {{a}}add them to the site first{{/a}}.',
							{ components: { a: <a href={ `/people/new/${ selectedSite?.slug }` } /> } }
						) }
					</p>
				</>
			);
		}

		return (
			<>
				<p>
					{ translate(
						'Transferring a domain to another user will give all the rights of the domain to that user. ' +
							'Please choose an administrator to transfer {{strong}}%(domainName)s{{/strong}} to.',
						{ args: { domainName }, components: { strong: <strong /> } }
					) }
				</p>
				<p>
					{ translate(
						'You can transfer this domain to any administrator on this site. If the user you want to ' +
							'transfer is not currently an administrator, please {{a}}add them to the site first{{/a}}.',
						{ components: { a: <a href={ `/people/new/${ selectedSite?.slug }` } /> } }
					) }
				</p>
			</>
		);
	}

	filterAvailableUsers( users ) {
		return users.filter(
			( user ) =>
				getWpcomUserId( user ) !== false && getWpcomUserId( user ) !== this.props.currentUserId
		);
	}

	isDataReady() {
		return this.props.hasSiteDomainsLoaded && ! this.props.isRequestingSiteDomains;
	}
}

const withUsers = createHigherOrderComponent(
	( Wrapped ) => ( props ) => {
		const siteId = useSelector( getSelectedSiteId );
		const usersQuery = useUsersQuery( siteId, { role: 'administrator' } );
		const users = usersQuery.data?.users ?? [];

		return <Wrapped { ...props } users={ users } />;
	},
	'WithUsers'
);

export default connect(
	( state, ownProps ) => {
		const domain = ! ownProps.isRequestingSiteDomains && getSelectedDomain( ownProps );

		return {
			currentUserId: getCurrentUserId( state ),
			isMapping: Boolean( domain ) && isMappedDomain( domain ),
			hasSiteDomainsLoaded: hasLoadedSiteDomains( state, ownProps.selectedSite?.ID ),
			currentRoute: getCurrentRoute( state ),
		};
	},
	{
		successNotice,
		errorNotice,
	}
)( localize( withUsers( TransferDomainToOtherUser ) ) );
