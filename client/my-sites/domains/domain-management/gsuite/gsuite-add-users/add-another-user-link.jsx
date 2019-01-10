/**
 * External dependencies
 */
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal dependencies
 */
import { composeAnalytics, recordGoogleEvent, recordTracksEvent } from 'state/analytics/actions';

/**
 * Style dependencies
 */
import './add-users.scss';

class AddAnotherUserLink extends React.Component {
	handleAddUserClick = event => {
		event.preventDefault();
		this.props.recordAddUserClick( this.props.domain );
		this.props.addBlankUser();
	};

	render() {
		return (
			<button
				type="button"
				className="gsuite-add-users__add-another-email-address-link"
				onClick={ this.handleAddUserClick }
			>
				{ this.props.translate( '+ Add another email address' ) }
			</button>
		);
	}
}

const recordAddUserClick = domainName =>
	composeAnalytics(
		recordGoogleEvent(
			'Domain Management',
			'Clicked "Add another email address" link in Add Google Apps',
			'Domain Name',
			domainName
		),
		recordTracksEvent(
			'calypso_domain_management_add_google_apps_add_another_email_address_click',
			{ domain_name: domainName }
		)
	);

AddAnotherUserLink.propTypes = {
	addBlankUser: PropTypes.func.isRequired,
	domain: PropTypes.string.isRequired,
	recordAddUserClick: PropTypes.func.isRequired,
	translate: PropTypes.func.isRequired,
};

export default connect(
	null,
	{
		recordAddUserClick,
	}
)( localize( AddAnotherUserLink ) );
