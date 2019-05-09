/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import HeaderCake from 'components/header-cake';
/**
 * Internal dependencies
 */
import './style.scss';
import { getSelectedSite, getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';

class MembershipsProductsSection extends Component {
	render() {
		return (
			<div>
				<HeaderCake backHref={ '/earn/memberships/' + this.props.siteSlug }>
					{ this.props.translate( 'Membership Amounts' ) }
				</HeaderCake>
			</div>
		);
	}
}

export default connect(
	state => {
		const site = getSelectedSite( state );
		const siteId = getSelectedSiteId( state );
		return {
			site,
			siteId,
			siteSlug: getSelectedSiteSlug( state ),
		};
	},
	{}
)( localize( MembershipsProductsSection ) );
