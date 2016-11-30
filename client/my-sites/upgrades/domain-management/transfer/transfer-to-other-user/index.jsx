/**
 * External Dependencies
 **/
import React from 'react';
import { connect } from 'react-redux';
import includes from 'lodash/includes';

/**
 * Internal Dependencies
 **/
import { localize } from 'i18n-calypso';
import Card from 'components/card';
import { requestSiteRoles } from 'state/site-roles/actions';
import { getSiteRoles } from 'state/site-roles/selectors';
import { getCurrentUser } from 'state/current-user/selectors';
import Header from 'my-sites/upgrades/domain-management/components/header';
import Main from 'components/main';
import paths from 'my-sites/upgrades/paths';
import FormSelect from 'components/forms/form-select';
import FormButton from 'components/forms/form-button';
import FormFieldset from 'components/forms/form-fieldset';

class TransferOtherUser extends React.Component {
	render() {
		const { selectedSite, selectedDomainName: domainName, translate, users } = this.props;
		const { slug } = selectedSite;

		const availableUsers = users
			.filter( user => includes( user.roles, 'administrator' ) && user.ID !== this.props.currentUser.ID );

		return (
			<Main className="transfer-to-other-user">
				<Header
					selectedDomainName={ domainName }
					backHref={ paths.domainManagementEdit( slug, domainName ) }>
					{ translate( 'Transfer Domain To Another User' ) }
				</Header>
				<Card>
					<div>
						{ translate( 'Transferring a domain to another user will give all the rights of the domain to that user. ' +
							'Please choose a user to the transfer %(domainName)s.', { args: { domainName } } ) }
					</div>
					<FormFieldset>
						<FormSelect className="transfer-to-other-user__select">
							{ availableUsers.map( ( { first_name, last_name, nice_name }, idx ) => (
								<option key={ idx }>
									{ ( first_name && last_name ) ? `${ first_name } ${ last_name } (${ nice_name })` : nice_name }
								</option>
							) ) }
						</FormSelect>
					</FormFieldset>
					<FormButton>{ translate( 'Transfer Domain' ) }</FormButton>
				</Card>
			</Main>
		);
	}
}

export default connect(
	( state, ownProps ) => {
		return {
			siteRoles: getSiteRoles( state, ownProps.selectedSite.ID ),
			currentUser: getCurrentUser( state )
		};
	},
	{ requestSiteRoles }
)( localize( TransferOtherUser ) );
