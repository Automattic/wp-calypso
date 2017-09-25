/** @format */
/**
 * External dependencies
 */
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';
import React, { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import config from 'config';
import { abtest } from 'lib/abtest';
import { recordTracksEvent } from 'state/analytics/actions';
import { hasJetpackSites } from 'state/selectors';

class SiteSelectorAddSite extends Component {
	getAddNewSiteUrl() {
		if ( this.props.hasJetpackSites || abtest( 'newSiteWithJetpack' ) === 'showNewJetpackSite' ) {
			return '/jetpack/new/?ref=calypso-selector';
		}
		return config( 'signup_url' ) + '?ref=calypso-selector';
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
