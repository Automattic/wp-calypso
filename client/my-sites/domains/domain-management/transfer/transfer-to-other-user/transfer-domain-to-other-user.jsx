import { Dialog } from '@automattic/components';
import { createHigherOrderComponent } from '@wordpress/compose';
import { localize } from 'i18n-calypso';
import page from 'page';
import PropTypes from 'prop-types';
import { Component, Fragment } from 'react';
import { connect, useSelector } from 'react-redux';
import FormattedHeader from 'calypso/components/formatted-header';
import FormButton from 'calypso/components/forms/form-button';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormSelect from 'calypso/components/forms/form-select';
import Main from 'calypso/components/main';
import useUsersQuery from 'calypso/data/users/use-users-query';
import BodySectionCssClass from 'calypso/layout/body-section-css-class';
import { getSelectedDomain, isMappedDomain } from 'calypso/lib/domains';
import wp from 'calypso/lib/wp';
import Breadcrumbs from 'calypso/my-sites/domains/domain-management/components/breadcrumbs';
import DesignatedAgentNotice from 'calypso/my-sites/domains/domain-management/components/designated-agent-notice';
import DomainMainPlaceholder from 'calypso/my-sites/domains/domain-management/components/domain/main-placeholder';
import NonOwnerCard from 'calypso/my-sites/domains/domain-management/components/domain/non-owner-card';
import {
	domainManagementEdit,
	domainManagementList,
	domainManagementTransfer,
} from 'calypso/my-sites/domains/paths';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';
import { successNotice, errorNotice } from 'calypso/state/notices/actions';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import { hasLoadedSiteDomains } from 'calypso/state/sites/domains/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

import './style.scss';

const wpcom = wp.undocumented();

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
		page( domainManagementTransfer( selectedSite.slug, selectedDomainName, currentRoute ) );
	};

	handleConfirmTransferDomain( closeDialog ) {
		const { selectedDomainName } = this.props;
		const selectedUserDisplay = this.getSelectedUserDisplayName();
		const successMessage = this.props.translate(
			'%(selectedDomainName)s has been transferred to %(selectedUserDisplay)s',
			{ args: { selectedDomainName, selectedUserDisplay } }
		);
		const defaultErrorMessage = this.props.translate(
			'Failed to transfer %(selectedDomainName)s, please try again or contact support.',
			{
				args: { selectedDomainName },
			}
		);

		this.setState( { disableDialogButtons: true } );
		wpcom
			.transferToUser(
				this.props.selectedSite.ID,
				this.props.selectedDomainName,
				this.state.selectedUserId
			)
			.then(
				() => {
					this.setState( { disableDialogButtons: false } );
					this.props.successNotice( successMessage, { duration: 4000, isPersistent: true } );
					closeDialog();
					page(
						domainManagementEdit(
							this.props.selectedSite.slug,
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

	renderBreadcrumbs() {
		const { translate, selectedSite, selectedDomainName, currentRoute } = this.props;

		const items = [
			{
				label: translate( 'Domains' ),
				href: domainManagementList( selectedSite.slug, selectedDomainName ),
			},
			{
				label: selectedDomainName,
				href: domainManagementEdit( selectedSite.slug, selectedDomainName, currentRoute ),
			},
			{
				label: translate( 'Transfer' ),
				href: domainManagementTransfer( selectedSite.slug, selectedDomainName, currentRoute ),
			},
			{ label: translate( 'Transfer to another user' ) },
		];

		const mobileItem = {
			label: translate( 'Back to Transfer' ),
			href: domainManagementTransfer( selectedSite.slug, selectedDomainName, currentRoute ),
			showBackArrow: true,
		};

		return <Breadcrumbs items={ items } mobileItem={ mobileItem } />;
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

		const { translate } = this.props;

		return (
			<Main wideLayout>
				<BodySectionCssClass bodyClass={ [ 'transfer-to-other-user' ] } />
				{ this.renderBreadcrumbs() }
				<FormattedHeader
					brandFont
					headerText={ translate( 'Transfer to another user' ) }
					align="left"
				/>
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
				'Do you want to transfer the domain mapping of {{strong}}%(domainName)s{{/strong}} ' +
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
		const { currentUserCanManage, domainRegistrationAgreementUrl } = getSelectedDomain(
			this.props
		);

		if ( ! currentUserCanManage ) {
			const { domains, selectedDomainName } = this.props;
			return <NonOwnerCard domains={ domains } selectedDomainName={ selectedDomainName } />;
		}

		const { isMapping, translate, users } = this.props;
		const availableUsers = this.filterAvailableUsers( users );
		const saveButtonLabel = isMapping
			? translate( 'Transfer domain mapping' )
			: translate( 'Transfer domain' );

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
							'Please choose an administrator to transfer domain mapping of {{strong}}%(domainName)s{{/strong}} to.',
							{ args: { domainName }, components: { strong: <strong /> } }
						) }
					</p>
					<p>
						{ translate(
							'You can transfer this domain mapping to any administrator on this site. If the user you want to ' +
								'transfer is not currently an administrator, please {{a}}add them to the site first{{/a}}.',
							{ components: { a: <a href={ `/people/new/${ selectedSite.slug }` } /> } }
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
						{ components: { a: <a href={ `/people/new/${ selectedSite.slug }` } /> } }
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
			hasSiteDomainsLoaded: hasLoadedSiteDomains( state, ownProps.selectedSite.ID ),
			currentRoute: getCurrentRoute( state ),
		};
	},
	{
		successNotice,
		errorNotice,
	}
)( localize( withUsers( TransferDomainToOtherUser ) ) );
