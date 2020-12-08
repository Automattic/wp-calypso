/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import Gridicon from 'calypso/components/gridicon';

/**
 * Internal dependencies
 */
import config from 'calypso/config';
import { Button } from '@automattic/components';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

class SiteSelectorAddSite extends Component {
	recordAddNewSite = () => {
		this.props.recordTracksEvent( 'calypso_add_new_wordpress_click' );
	};

	render() {
		const { translate } = this.props;
		return (
			<span className="site-selector__add-new-site">
				<Button
					borderless
					href={ `${ config( 'signup_url' ) }?ref=calypso-selector` }
					onClick={ this.recordAddNewSite }
				>
					<Gridicon icon="add-outline" /> { translate( 'Add new site' ) }
				</Button>
			</span>
		);
	}
}

export default connect( null, { recordTracksEvent } )( localize( SiteSelectorAddSite ) );
