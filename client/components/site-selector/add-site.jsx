/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Gridicon from 'components/gridicon';
import { recordTracksEvent } from 'state/analytics/actions';
import config from 'config';

const SiteSelectorAddSite = React.createClass( {
	recordAddNewSite() {
		this.props.recordTracksEvent( 'calypso_add_new_wordpress_click' );
	},

	renderButton() {
		return (
			<span className="site-selector__add-new-site">
				<Button compact borderless href={ config( 'signup_url' ) + '?ref=calypso-selector' } onClick={ this.recordAddNewSite }>
					<Gridicon icon="add-outline" /> { this.translate( 'Add New Site' ) }
				</Button>
			</span>
		);
	},

	render() {
		return this.renderButton();
	}
} );

export default connect(
	null,
	dispatch => bindActionCreators( {
		recordTracksEvent
	}, dispatch )
)( SiteSelectorAddSite );
