/** @format */

/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import { getCurrentUser } from 'state/current-user/selectors';
import Main from 'components/main';
import { successNotice, errorNotice } from 'state/notices/actions';

class TransferSiteToUser extends React.Component {
	constructor( props ) {
		super( props );
	}

	render() {
		return <Main className="transfer-site-to-user" />;
	}
}

export default connect( state => ( { currentUser: getCurrentUser( state ) } ), {
	successNotice,
	errorNotice,
} )( localize( TransferSiteToUser ) );
