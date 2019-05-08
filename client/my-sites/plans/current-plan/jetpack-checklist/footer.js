/**
 * External dependencies
 */
import { connect } from 'react-redux';
import { get } from 'lodash';
import { localize } from 'i18n-calypso';
import React, { PureComponent } from 'react';

/**
 * Internal dependencies
 */
import { getSelectedSite } from 'state/ui/selectors';
import { recordTracksEvent } from 'state/analytics/actions';
import { untrailingslashit } from 'lib/route';
import Button from 'components/button';
import Card from 'components/card';

class JetpackChecklistFooter extends PureComponent {
	handleWPAdminLink = () => {
		this.props.recordTracksEvent( 'calypso_checklist_wpadmin_click', {
			checklist_name: 'jetpack',
			location: 'JetpackChecklist',
		} );
	};

	render() {
		const { translate, wpAdminUrl } = this.props;
		return (
			<Card compact className="jetpack-checklist__footer">
				<p>{ translate( 'Return to your self-hosted WordPress dashboard.' ) }</p>
				<Button compact href={ wpAdminUrl } onClick={ this.handleWPAdminLink }>
					{ translate( 'Return to WP Admin' ) }
				</Button>
			</Card>
		);
	}
}

export default connect(
	state => {
		const site = getSelectedSite( state );

		return {
			wpAdminUrl: untrailingslashit( get( site, 'options.admin_url' ) ) + '/admin.php?page=jetpack',
		};
	},
	{
		recordTracksEvent,
	}
)( localize( JetpackChecklistFooter ) );
