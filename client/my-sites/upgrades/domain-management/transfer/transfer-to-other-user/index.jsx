/**
 * External Dependencies
 **/
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal Dependencies
 **/
import { localize } from 'i18n-calypso';
import Card from 'components/card';
import { requestSiteRoles } from 'state/site-roles/actions';
import { getSiteRoles } from 'state/site-roles/selectors';

class TransferOtherUser extends React.Component {
	render() {
		return (
			<Card>
				<ul>
					{ this.props.users.map( ( { first_name, last_name, nice_name } ) => (
						<li>
							{ ( first_name && last_name ) ? first_name + ' ' + last_name : nice_name }
						</li>
					) ) }
				</ul>
			</Card>
		);
	}
}

export default connect(
	( state, ownProps ) => {
		return {
			siteRoles: getSiteRoles( state, ownProps.selectedSite.ID )
		};
	},
	{ requestSiteRoles }
)( localize( TransferOtherUser ) );
