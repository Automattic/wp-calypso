/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import { find, get, head, includes, omit } from 'lodash';
import page from 'page';
import { localize } from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import { Card, Dialog } from '@automattic/components';
import { getCurrentUser } from 'state/current-user/selectors';
import Header from 'my-sites/domains/domain-management/components/header';
import Main from 'components/main';
import { domainManagementEdit, domainManagementTransfer } from 'my-sites/domains/paths';
import FormSelect from 'components/forms/form-select';
import FormButton from 'components/forms/form-button';
import FormFieldset from 'components/forms/form-fieldset';
import wp from 'lib/wp';
import { getSelectedDomain } from 'lib/domains';
import NonOwnerCard from 'my-sites/domains/domain-management/components/domain/non-owner-card';
import DomainMainPlaceholder from 'my-sites/domains/domain-management/components/domain/main-placeholder';
import { successNotice, errorNotice } from 'state/notices/actions';
import DesignatedAgentNotice from 'my-sites/domains/domain-management/components/designated-agent-notice';
import isSiteAutomatedTransfer from 'state/selectors/is-site-automated-transfer';
import { hasLoadedSiteDomains } from 'state/sites/domains/selectors';

/**
 * Style dependencies
 */
import './style.scss';

const wpcom = wp.undocumented();

class TransferOtherUser extends React.Component {
	static propTypes = {
		currentUser: PropTypes.object.isRequired,
		domains: PropTypes.array.isRequired,
		isAtomic: PropTypes.bool.isRequired,
		isRequestingSiteDomains: PropTypes.bool.isRequired,
		selectedDomainName: PropTypes.string.isRequired,
		selectedSite: PropTypes.oneOfType( [ PropTypes.object, PropTypes.bool ] ).isRequired,
		users: PropTypes.array.isRequired,
		wapiDomainInfo: PropTypes.object.isRequired,
	};

	constructor( props ) {
		super( props );

		const defaultUser = head( this.filterAvailableUsers( props.users ) );
		this.state = {
			selectedUserId: defaultUser ? this.getWpcomUserId( defaultUser ) : '',
			showConfirmationDialog: false,
			disableDialogButtons: false,
		};

		this.handleUserChange = this.handleUserChange.bind( this );
		this.handleTransferDomain = this.handleTransferDomain.bind( this );
		this.handleDialogClose = this.handleDialogClose.bind( this );
		this.handleConfirmTransferDomain = this.handleConfirmTransferDomain.bind( this );
	}

	getWpcomUserId = ( user ) => {
		if ( this.props.isAtomic ) {
			return get( user, 'linked_user_ID', '' );
		}

		return user.ID;
	};

	UNSAFE_componentWillUpdate( nextProps, nextState ) {
		if ( nextState && ! nextState.selectedUserId ) {
			const defaultUser = head( this.filterAvailableUsers( nextProps.users ) );
			if ( defaultUser ) {
				this.setState( { selectedUserId: this.getWpcomUserId( defaultUser ) } );
			}
		}
	}

	handleUserChange( event ) {
		event.preventDefault();

		this.setState( { selectedUserId: event.target.value } );
	}

	handleTransferDomain() {
		this.setState( { showConfirmationDialog: true } );
	}

	handleConfirmTransferDomain( closeDialog ) {
		const { selectedDomainName } = this.props,
			selectedUserDisplay = this.getSelectedUserDisplayName(),
			successMessage = this.props.translate(
				'%(selectedDomainName)s has been transferred to %(selectedUserDisplay)s',
				{ args: { selectedDomainName, selectedUserDisplay } }
			),
			defaultErrorMessage = this.props.translate(
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
						domainManagementEdit( this.props.selectedSite.slug, this.props.selectedDomainName )
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
		const selectedUser = find(
			this.props.users,
			( user ) => this.getWpcomUserId( user ) === Number( this.state.selectedUserId )
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

		const { selectedSite, selectedDomainName } = this.props,
			{ slug } = selectedSite;

		return (
			<Main>
				<Header
					selectedDomainName={ selectedDomainName }
					backHref={ domainManagementTransfer( slug, selectedDomainName ) }
				>
					{ this.props.translate( 'Transfer Domain To Another User' ) }
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
			],
			domainName = this.props.selectedDomainName,
			selectedUserDisplay = this.getSelectedUserDisplayName();
		return (
			<Dialog
				className="transfer-to-other-user__confirmation-dialog"
				isVisible={ this.state.showConfirmationDialog }
				buttons={ buttons }
				onClose={ this.handleDialogClose }
			>
				<h1>{ this.props.translate( 'Confirm Transfer' ) }</h1>
				<p>
					{ this.props.translate(
						'Do you want to transfer the ownership of {{strong}}%(domainName)s{{/strong}} ' +
							'to {{strong}}%(selectedUserDisplay)s{{/strong}}?',
						{
							args: { domainName, selectedUserDisplay },
							components: { strong: <strong /> },
						}
					) }
				</p>
			</Dialog>
		);
	}

	renderSection() {
		const { selectedDomainName: domainName, translate, users, selectedSite } = this.props,
			availableUsers = this.filterAvailableUsers( users ),
			{ currentUserCanManage, domainRegistrationAgreementUrl } = getSelectedDomain( this.props ),
			saveButtonLabel = translate( 'Transfer domain' );

		if ( ! currentUserCanManage ) {
			return <NonOwnerCard { ...omit( this.props, [ 'children' ] ) } />;
		}

		return (
			<Fragment>
				<Card>
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
					<FormFieldset>
						<FormSelect
							disabled={ availableUsers.length === 0 }
							className="transfer-to-other-user__select"
							onChange={ this.handleUserChange }
							value={ this.state.selectedUserId }
						>
							{ availableUsers.length ? (
								availableUsers.map( ( user ) => {
									const userId = this.getWpcomUserId( user );

									return (
										<option key={ userId } value={ userId }>
											{ this.getUserDisplayName( user ) }
										</option>
									);
								} )
							) : (
								<option value="">{ translate( '-- Site has no other administrators --' ) }</option>
							) }
						</FormSelect>
					</FormFieldset>
					<DesignatedAgentNotice
						domainRegistrationAgreementUrl={ domainRegistrationAgreementUrl }
						saveButtonLabel={ saveButtonLabel }
					/>
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

	filterAvailableUsers( users ) {
		return users.filter(
			( user ) =>
				includes( user.roles, 'administrator' ) &&
				this.getWpcomUserId( user ) !== this.props.currentUser.ID
		);
	}

	isDataReady() {
		return (
			this.props.hasSiteDomainsLoaded &&
			this.props.wapiDomainInfo.hasLoadedFromServer &&
			! this.props.isRequestingSiteDomains
		);
	}
}

export default connect(
	( state, ownProps ) => ( {
		currentUser: getCurrentUser( state ),
		isAtomic: isSiteAutomatedTransfer( state, ownProps.selectedSite.ID ),
		hasSiteDomainsLoaded: hasLoadedSiteDomains( state, ownProps.selectedSite.ID ),
	} ),
	{
		successNotice,
		errorNotice,
	}
)( localize( TransferOtherUser ) );
