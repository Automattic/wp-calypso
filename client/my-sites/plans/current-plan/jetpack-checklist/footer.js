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
import { format as formatUrl, parse as parseUrl } from 'url';
import { getSelectedSite } from 'state/ui/selectors';
import { recordTracksEvent } from 'state/analytics/actions';
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

		if ( ! wpAdminUrl ) {
			return null;
		}

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

		// Link to "My Plan" page in Jetpack
		let wpAdminUrl = get( site, 'options.admin_url', '' );
		wpAdminUrl = wpAdminUrl
			? formatUrl( {
					...parseUrl( wpAdminUrl ),
					query: { page: 'jetpack' },
					hash: '/my-plan',
			  } )
			: '';

		return {
			wpAdminUrl,
		};
	},
	{
		recordTracksEvent,
	}
)( localize( JetpackChecklistFooter ) );
