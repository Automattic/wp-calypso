/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { getSelectedSite } from 'state/ui/selectors';
import SidebarItem from 'layout/sidebar/item';
import SidebarMenu from 'layout/sidebar/menu';
import { localize } from 'i18n-calypso';
import { addSiteFragment } from 'lib/route/path';

class SitesSidebarMenu extends React.Component {
	renderStats() {
		const { selectedSite, onNavigate, translate } = this.props;

		if ( selectedSite && ! selectedSite.capabilities ) {
			return null;
		}

		if ( selectedSite && selectedSite.capabilities && ! selectedSite.capabilities.view_stats ) {
			return null;
		}

		return <SidebarItem
					key="stats"
					label={ translate( 'Stats' ) }
					link={ addSiteFragment( '/stats/insights', selectedSite.slug ) }
					onNavigate={ onNavigate }
					icon="stats-alt"
				/>;
	}

	render() {
		const { extraChildren, translate } = this.props;
		return (
			<SidebarMenu>
				<ul>
					{ this.renderStats() }
					<SidebarItem
						key="plan"
						label={ translate( 'Plan' ) }
						link=""
						onNavigate={ null }
						icon="clipboard"
					/>
					{ extraChildren }
				</ul>
			</SidebarMenu>
		);
	}
}

export default connect(
	( state ) => {
		const selectedSite = getSelectedSite( state );

		return {
			selectedSite
		};
	}
)( localize( SitesSidebarMenu ) );
