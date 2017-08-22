/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { localize } from 'i18n-calypso';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import { recordTracksEvent } from 'state/analytics/actions';
import config from 'config';
import { abtest } from 'lib/abtest';
import { hasJetpackSites } from 'state/selectors';

class SiteSelectorAddSite extends Component {
	constructor() {
		super();

		this.recordAddNewSite = this.recordAddNewSite.bind( this );
	}

	getAddNewSiteUrl() {
		if ( this.props.hasJetpackSites || abtest( 'newSiteWithJetpack' ) === 'showNewJetpackSite' ) {
			return '/jetpack/new/?ref=calypso-selector';
		}
		return config( 'signup_url' ) + '?ref=calypso-selector';
	}

	recordAddNewSite() {
		this.props.recordTracksEvent( 'calypso_add_new_wordpress_click' );
	}

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
	dispatch =>
		bindActionCreators(
			{
				recordTracksEvent,
			},
			dispatch
		)
)( localize( SiteSelectorAddSite ) );
