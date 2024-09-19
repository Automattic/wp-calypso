import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import Sidebar from 'calypso/layout/sidebar';
import SidebarFooter from 'calypso/layout/sidebar/footer';
import SidebarItem from 'calypso/layout/sidebar/item';
import SidebarMenu from 'calypso/layout/sidebar/menu';
import SidebarRegion from 'calypso/layout/sidebar/region';
import CurrentSite from 'calypso/my-sites/current-site';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getJetpackAdminUrl } from 'calypso/state/sites/selectors';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import JetpackCloudSidebarMenuItems from './menu-items/jetpack-cloud';
import JetpackIcons from './menu-items/jetpack-icons';

import './style.scss';

class JetpackCloudSidebar extends Component {
	static propTypes = {
		path: PropTypes.string.isRequired,
		selectedSiteSlug: PropTypes.string,
		threats: PropTypes.array,
	};

	onGetHelp = () => {
		this.props.dispatchRecordTracksEvent( 'calypso_jetpack_sidebar_menu_click', {
			menu_item: 'Jetpack Cloud / Support',
		} );

		window.scrollTo( 0, 0 );
	};

	render() {
		const { translate, jetpackAdminUrl, path } = this.props;

		return (
			<Sidebar className="sidebar__jetpack-cloud">
				<SidebarRegion>
					<CurrentSite />
					<SidebarMenu>
						<JetpackCloudSidebarMenuItems path={ path } />
					</SidebarMenu>
				</SidebarRegion>
				<SidebarFooter>
					<SidebarMenu>
						<SidebarItem
							label={ translate( 'WP Admin', {
								comment: 'Jetpack Cloud sidebar navigation item',
							} ) }
							link={ jetpackAdminUrl }
							customIcon={ <JetpackIcons icon="wordpress" /> }
						/>
						<SidebarItem
							label={ translate( 'Get help', {
								comment: 'Jetpack Cloud sidebar navigation item',
							} ) }
							link="https://jetpack.com/support"
							className="sidebar__jetpack-cloud-item-has-border"
							customIcon={ <JetpackIcons icon="help" /> }
							onNavigate={ this.onGetHelp }
						/>
					</SidebarMenu>
				</SidebarFooter>
			</Sidebar>
		);
	}
}

export default connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );
		const jetpackAdminUrl = getJetpackAdminUrl( state, siteId );

		return {
			jetpackAdminUrl,
			selectedSiteSlug: getSelectedSiteSlug( state ),
		};
	},
	{
		dispatchRecordTracksEvent: recordTracksEvent,
	}
)( localize( JetpackCloudSidebar ) );
