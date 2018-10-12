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

class SiteBlockListItem extends Component {
	render() {
		const { site } = this.props;
		return (
			<div>
				<a href={ site.URL }>{ site.name }</a>
			</div>
		);
	}
}

export default connect( ( state, ownProps ) => {
	return {
		site: getSite( state, ownProps.siteId ),
	};
} )( localize( SiteBlockListItem ) );
