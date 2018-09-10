/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import GridiconAddOutline from 'gridicons/dist/add-outline';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import { recordTracksEvent } from 'state/analytics/actions';

class SiteSelectorAddSite extends Component {
	getAddNewSiteUrl() {
		return '/jetpack/new/?ref=calypso-selector';
	}

	recordAddNewSite = () => {
		this.props.recordTracksEvent( 'calypso_add_new_wordpress_click' );
	};

	render() {
		const { translate } = this.props;
		return (
			<span className="site-selector__add-new-site">
				<Button borderless href={ this.getAddNewSiteUrl() } onClick={ this.recordAddNewSite }>
					<GridiconAddOutline /> { translate( 'Add New Site' ) }
				</Button>
			</span>
		);
	}
}

export default connect(
	null,
	{ recordTracksEvent }
)( localize( SiteSelectorAddSite ) );
