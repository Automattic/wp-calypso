/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import QueryMembershipsEarnings from 'components/data/query-memberships-earnings';

/**
 * Internal dependencies
 */
import { getSelectedSite, getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';

class MembershipsSection extends Component {
	render() {
		return (
			<div>
				<QueryMembershipsEarnings siteId={ this.props.siteId } />
				<div>{ 'Potato' }</div>
			</div>
		);
	}
}

const mapStateToProps = state => {
	const site = getSelectedSite( state );
	const siteId = getSelectedSiteId( state );
	return {
		site,
		siteId,
		siteSlug: getSelectedSiteSlug( state ),
	};
};

export default connect( mapStateToProps )( localize( MembershipsSection ) );
