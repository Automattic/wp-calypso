/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import { connect, useSelector } from 'react-redux';
import page from 'page';
import { localize } from 'i18n-calypso';
import { createHigherOrderComponent } from '@wordpress/compose';

/**
 * Internal Dependencies
 */
import { Card, Dialog } from '@automattic/components';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';
import Header from 'calypso/my-sites/domains/domain-management/components/header';
import Main from 'calypso/components/main';
import { domainManagementEdit, domainManagementTransfer } from 'calypso/my-sites/domains/paths';
import FormSelect from 'calypso/components/forms/form-select';
import FormButton from 'calypso/components/forms/form-button';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import wp from 'calypso/lib/wp';
import { getSelectedDomain, isMappedDomain } from 'calypso/lib/domains';
import NonOwnerCard from 'calypso/my-sites/domains/domain-management/components/domain/non-owner-card';
import DomainMainPlaceholder from 'calypso/my-sites/domains/domain-management/components/domain/main-placeholder';
import { successNotice, errorNotice } from 'calypso/state/notices/actions';
import DesignatedAgentNotice from 'calypso/my-sites/domains/domain-management/components/designated-agent-notice';
import { hasLoadedSiteDomains } from 'calypso/state/sites/domains/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import useUsersQuery from 'calypso/data/users/use-users-query';

/**
 * Style dependencies
 */
import './style.scss';

const wpcom = wp.undocumented();

const getWpcomUserId = ( user ) => user.linked_user_ID ?? user.ID;

class TransferOtherUser extends React.Component {
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

	render() {
		if ( ! this.isDataReady() ) {
			return <DomainMainPlaceholder goBack={ this.goToEdit } />;
		}

		const { selectedSite, selectedDomainName, translate, currentRoute } = this.props;
		const { slug } = selectedSite;

		return (
			<Main>
				<Header
					selectedDomainName={ selectedDomainName }
					backHref={ domainManagementTransfer( slug, selectedDomainName, currentRoute ) }
				>
					{ this.props.isMapping
						? translate( 'Transfer Domain Mapping To Another User' )
						: translate( 'Transfer Domain To Another User' ) }
				</Header>
				{ this.renderSection() }
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
			<Fragment>
				<Card>
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
									<option value="">{ translate( '-- Select User --' ) }</option>
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
					<FormButton
						disabled={ ! this.state.selectedUserId }
						onClick={ this.handleTransferDomain }
					>
						{ saveButtonLabel }
					</FormButton>
				</Card>
				{ this.renderDialog() }
			</Fragment>
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
)( localize( withUsers( TransferOtherUser ) ) );
