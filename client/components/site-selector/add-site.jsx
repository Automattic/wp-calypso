/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import Button from 'client/components/button';
import { recordTracksEvent } from 'client/state/analytics/actions';
import { hasJetpackSites } from 'client/state/selectors';

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
					<Gridicon icon="add-outline" /> { translate( 'Add New Site' ) }
				</Button>
			</span>
		);
	}
}

export default connect(
	state => ( {
		hasJetpackSites: hasJetpackSites( state ),
	} ),
	{
		recordTracksEvent,
	}
)( localize( SiteSelectorAddSite ) );
