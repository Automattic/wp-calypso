/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { getSite } from 'state/reader/sites/selectors';
import ExternalLink from 'components/external-link';

class SiteBlockListItem extends Component {
	render() {
		const { site } = this.props;
		return (
			<div className="site-blocks__list-item">
				<ExternalLink href={ site.URL }>{ site.name }</ExternalLink>
			</div>
		);
	}
}

export default connect( ( state, ownProps ) => {
	return {
		site: getSite( state, ownProps.siteId ),
	};
} )( localize( SiteBlockListItem ) );
