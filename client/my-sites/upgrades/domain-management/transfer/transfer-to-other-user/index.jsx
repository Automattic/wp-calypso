/**
 * External Dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { includes, head, omit, find } from 'lodash';

/**
 * Internal Dependencies
 */
import { localize } from 'i18n-calypso';
import Card from 'components/card';
import { getCurrentUser } from 'state/current-user/selectors';
import Header from 'my-sites/upgrades/domain-management/components/header';
import Main from 'components/main';
import paths from 'my-sites/upgrades/paths';
import FormSelect from 'components/forms/form-select';
import FormButton from 'components/forms/form-button';
import FormFieldset from 'components/forms/form-fieldset';
import wp from 'lib/wp';
import { getSelectedDomain } from 'lib/domains';
import NonOwnerCard from 'my-sites/upgrades/domain-management/components/domain/non-owner-card';
import DomainMainPlaceholder from 'my-sites/upgrades/domain-management/components/domain/main-placeholder';
import SectionHeader from 'components/section-header';
import Dialog from 'components/dialog';
import { successNotice, errorNotice } from 'state/notices/actions';
import page from 'page';

const wpcom = wp.undocumented();

class TransferOtherUser extends React.Component {

	static propTypes = {
		domains: React.PropTypes.object.isRequired,
		selectedDomainName: React.PropTypes.string.isRequired,
		selectedSite: React.PropTypes.oneOfType( [
			React.PropTypes.object,
			React.PropTypes.bool
		] ).isRequired,
		wapiDomainInfo: React.PropTypes.object.isRequired,
		currentUser: React.PropTypes.object.isRequired
	};

	constructor( props ) {
		super( props );

		this.state = {
			selectedUserId: '',
			showConfirmationDialog: false,
			disableDialogButtons: false
		};

		this.handleUserChange = this.handleUserChange.bind( this );
		this.handleTransferDomain = this.handleTransferDomain.bind( this );
		this.handleDialogClose = this.handleDialogClose.bind( this );
		this.handleConfirmTransferDomain = this.handleConfirmTransferDomain.bind( this );
	}

	componentWillUpdate( nextProps, nextState ) {
		if ( nextState && ! nextState.selectedUserId ) {
			const defaultUser = head( this.filterAvailableUsers( nextProps.users ) );
			if ( defaultUser ) {
				this.setState( { selectedUserId: defaultUser.ID } );
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
					{ args: { selectedDomainName, selectedUserDisplay } } ),
			defaultErrorMessage = this.props.translate(
				'Failed to transfer %(selectedDomainName)s, please try again or contact support.', {
					args: { selectedDomainName } } );

		this.setState( { disableDialogButtons: true } );
		wpcom.transferToUser( this.props.selectedSite.ID, this.props.selectedDomainName, this.state.selectedUserId )
			.then( () => {
				this.setState( { disableDialogButtons: false } );
				this.props.successNotice( successMessage, { duration: 4000, isPersistent: true } );
				page( paths.domainManagementEdit( this.props.selectedSite.slug, this.props.selectedDomainName ) );
				closeDialog();
			}, err => {
				this.setState( { disableDialogButtons: false } );
				this.props.errorNotice( err.message || defaultErrorMessage );
				closeDialog();
			} );
	}

	handleDialogClose() {
		if ( ! this.state.disableDialogButtons ) {
			this.setState( { showConfirmationDialog: false } );
		}
	}

	getSelectedUserDisplayName() {
		const selectedUser = find( this.props.users, user => user.ID === Number( this.state.selectedUserId ) );
		if ( ! selectedUser ) {
			return '';
		}
		return this.getUserDisplayName( selectedUser );
	}

	getUserDisplayName( { first_name, last_name, nice_name } ) {
		return ( first_name && last_name ) ? `${ first_name } ${ last_name } (${ nice_name })` : nice_name;
	}

	render() {
		if ( ! this.isDataReady() ) {
			return <DomainMainPlaceholder goBack={ this.goToEdit } />;
		}

		const { selectedSite, selectedDomainName } = this.props,
			{ slug } = selectedSite;

		return (
			<Main className="transfer-to-other-user">
				<Header
					selectedDomainName={ selectedDomainName }
					backHref={ paths.domainManagementEdit( slug, selectedDomainName ) }>
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
				disabled: this.state.disableDialogButtons
			},
			{
				action: 'confirm',
				label: this.props.translate( 'Confirm Transfer' ),
				onClick: this.handleConfirmTransferDomain,
				disabled: this.state.disableDialogButtons,
				isPrimary: true
			}
			],
			domainName = this.props.selectedDomainName,
			selectedUserDisplay = this.getSelectedUserDisplayName();
		return (
			<Dialog isVisible={ this.state.showConfirmationDialog } buttons={ buttons } onClose={ this.handleDialogClose }>
				<h1>{ this.props.translate( 'Confirm Transfer' ) }</h1>
				<p>{ this.props.translate( 'Do you want to transfer the ownership of {{strong}}%(domainName)s{{/strong}} ' +
					'to {{strong}}%(selectedUserDisplay)s{{/strong}}?', {
						args: { domainName, selectedUserDisplay }, components: { strong: <strong /> }
					} ) }</p>
			</Dialog>
		);
	}

	renderSection() {
		const { selectedDomainName: domainName, translate, users } = this.props,
			availableUsers = this.filterAvailableUsers( users ),
			{ currentUserCanManage } = getSelectedDomain( this.props );

		if ( ! currentUserCanManage ) {
			return <NonOwnerCard { ...omit( this.props, [ 'children' ] ) } />;
		}

		return (
			<div>
				<SectionHeader label={ translate( 'Transfer Domain To Another User' ) } />
				<Card className="transfer-card">
					<p>
						{ translate( 'Transferring a domain to another user will give all the rights of the domain to that user. ' +
							'Please choose a user to the transfer {{strong}}%(domainName)s{{/strong}}.',
							{ args: { domainName }, components: { strong: <strong /> } } ) }
					</p>
					<FormFieldset>
						<FormSelect
							className="transfer-to-other-user__select"
							onChange={ this.handleUserChange }
							value={ this.state.selectedUserId }>
							{ availableUsers.map( ( user ) => (
								<option key={ user.ID } value={ user.ID }>
									{ this.getUserDisplayName( user ) }
								</option>
							) ) }
						</FormSelect>
					</FormFieldset>
					<FormButton onClick={ this.handleTransferDomain }>{ translate( 'Transfer Domain' ) }</FormButton>
				</Card>
				{ this.renderDialog() }
			</div>
		);
	}

	filterAvailableUsers( users ) {
		return users
			.filter( user => includes( user.roles, 'administrator' ) && user.ID !== this.props.currentUser.ID );
	}

	isDataReady() {
		return this.props.wapiDomainInfo.hasLoadedFromServer && this.props.domains.hasLoadedFromServer;
	}
}

export default connect(
	state => ( { currentUser: getCurrentUser( state ) } ),
	{ successNotice, errorNotice }
)( localize( TransferOtherUser ) );
