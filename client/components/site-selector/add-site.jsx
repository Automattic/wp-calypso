/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import Gridicon from 'components/gridicon';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
import { recordTracksEvent } from 'state/analytics/actions';

class SiteSelectorAddSite extends Component {
	recordAddNewSite = () => {
		this.props.recordTracksEvent( 'calypso_add_new_wordpress_click' );
	};

	render() {
		const { translate } = this.props;
		return (
			<span className="site-selector__add-new-site">
				<Button borderless href="/start" onClick={ this.recordAddNewSite }>
					<Gridicon icon="add-outline" /> { translate( 'Add new site' ) }
				</Button>
			</span>
		);
	}
}

export default connect( null, { recordTracksEvent } )( localize( SiteSelectorAddSite ) );
