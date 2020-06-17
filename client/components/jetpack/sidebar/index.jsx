/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { memoize } from 'lodash';
import { format as formatUrl, parse as parseUrl } from 'url';

/**
 * Internal dependencies
 */
import { getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import { recordTracksEvent } from 'state/analytics/actions';
import CurrentSite from 'my-sites/current-site';
import getSiteAdminUrl from 'state/sites/selectors/get-site-admin-url';
import Sidebar from 'layout/sidebar';
import SidebarFooter from 'layout/sidebar/footer';
import SidebarItem from 'layout/sidebar/item';
import SidebarMenu from 'layout/sidebar/menu';
import SidebarRegion from 'layout/sidebar/region';
import JetpackCloudSidebarMenuItems from './menu-items/jetpack-cloud';

// To be removed after jetpack/features-section flags are permanently enabled
import isJetpackSectionEnabledForSite from 'state/selectors/is-jetpack-section-enabled-for-site';
import ExpandableSidebarMenu from 'layout/sidebar/expandable';
import QueryJetpackScan from 'components/data/query-jetpack-scan';
import { backupMainPath } from 'my-sites/backup/paths';
import { itemLinkMatches } from 'my-sites/sidebar/utils';
import { settingsPath } from 'lib/jetpack/paths';
import {
	expandMySitesSidebarSection as expandSection,
	toggleMySitesSidebarSection as toggleSection,
} from 'state/my-sites/sidebar/actions';
import { isSidebarSectionOpen } from 'state/my-sites/sidebar/selectors';
import getSiteScanProgress from 'state/selectors/get-site-scan-progress';
import getSiteScanThreats from 'state/selectors/get-site-scan-threats';
import ScanBadge from 'components/jetpack/scan-badge';
// Lowercase because these are used as keys for sidebar state.
export const SIDEBAR_SECTION_SCAN = 'scan';
export const SIDEBAR_SECTION_BACKUP = 'backup';
// End to-be-removed

/**
 * Style dependencies
 */
import './style.scss';
// We import these styles from here because this is the only section that gets always
// loaded when a user visits Jetpack Cloud. We might have to find a better place for
// this in the future.
import 'landing/jetpack-cloud/style.scss';

class JetpackCloudSidebar extends Component {
	static propTypes = {
		path: PropTypes.string.isRequired,
		selectedSiteSlug: PropTypes.string,
		threats: PropTypes.array,
	};

	onNavigate = memoize( ( menuItem ) => () => {
		this.props.dispatchRecordTracksEvent( 'calypso_jetpack_sidebar_menu_click', {
			menu_item: menuItem,
		} );

		window.scrollTo( 0, 0 );
	} );

	// To be removed after jetpack/features-section flags are permanently enabled
	/**
	 * Check if a menu item is selected.
	 *
	 * @param {string} path Menu item path
	 * @returns {boolean} True if menu item is selected
	 */
	isSelected( path ) {
		return this.props.path === path || this.props.path.startsWith( path );
	}
	expandScanSection = () => this.props.expandSection( SIDEBAR_SECTION_SCAN );
	expandBackupSection = () => this.props.expandSection( SIDEBAR_SECTION_BACKUP );
	toggleSection = memoize( ( id ) => () => this.props.toggleSection( id ) );
	// End to-be-removed

	sidebarItems() {
		if ( this.props.shouldShowJetpackSection ) {
			return (
				<SidebarMenu>
					<JetpackCloudSidebarMenuItems path={ this.props.path } />
				</SidebarMenu>
			);
		}

		// To be removed after jetpack/features-section flags
		// are permanently enabled: here thru end of method
		const { selectedSiteSlug, translate, threats, siteId, scanProgress } = this.props;
		const numberOfThreatsFound = threats.length;

		const backupTitle = 'Backup';
		const scanTitle = 'Scan';

		const scanBadge = (
			<ScanBadge progress={ scanProgress } numberOfThreatsFound={ numberOfThreatsFound } />
		);

		return (
			<>
				<ExpandableSidebarMenu
					onClick={ this.toggleSection( SIDEBAR_SECTION_BACKUP ) }
					expanded={ this.props.isBackupSectionOpen }
					title={ backupTitle }
					materialIcon="backup"
					materialIconStyle="filled"
				>
					<ul>
						<SidebarItem
							expandSection={ this.expandBackupSection }
							label={ translate( 'Latest backups', {
								comment: 'Jetpack Cloud / Backup sidebar navigation item',
							} ) }
							link={ backupMainPath( selectedSiteSlug ) }
							onNavigate={ this.onNavigate( 'Jetpack Cloud Backup / Latest backups' ) }
							selected={ itemLinkMatches( backupMainPath(), this.props.path ) }
						/>
						<SidebarItem
							expandSection={ this.expandBackupSection }
							label={ translate( 'Activity log', {
								comment: 'Jetpack Cloud / Activity Log status sidebar navigation item',
							} ) }
							link={ `/activity-log/${ selectedSiteSlug }` }
							onNavigate={ this.onNavigate( 'Jetpack Cloud Backup / Activity Log' ) }
							selected={ itemLinkMatches( `/activity-log`, this.props.path ) }
						/>
					</ul>
				</ExpandableSidebarMenu>

				<QueryJetpackScan siteId={ siteId } />
				<ExpandableSidebarMenu
					onClick={ this.toggleSection( SIDEBAR_SECTION_SCAN ) }
					expanded={ this.props.isScanSectionOpen }
					title={
						this.props.isScanSectionOpen ? (
							scanTitle
						) : (
							<a href={ selectedSiteSlug ? `/scan/${ selectedSiteSlug }` : '/scan' }>
								{ scanTitle } { scanBadge }{ ' ' }
							</a>
						)
					}
					materialIcon="security" // @todo: The Scan logo differs from the Material Icon used here
					materialIconStyle="filled"
				>
					<ul>
						<SidebarItem
							expandSection={ this.expandScanSection }
							label={ translate( 'Scanner', {
								comment: 'Jetpack Cloud / Scanner sidebar navigation item',
							} ) }
							link={ selectedSiteSlug ? `/scan/${ selectedSiteSlug }` : '/scan' }
							onNavigate={ this.onNavigate( 'Jetpack Cloud Scan / Scanner' ) }
							selected={
								itemLinkMatches( '/scan', this.props.path ) &&
								! itemLinkMatches( '/scan/history', this.props.path )
							}
						>
							{ scanBadge }
						</SidebarItem>
						<SidebarItem
							expandSection={ this.expandScanSection }
							label={ translate( 'History', {
								comment: 'Jetpack Cloud / Scan History sidebar navigation item',
							} ) }
							link={ selectedSiteSlug ? `/scan/history/${ selectedSiteSlug }` : '/scan/history' }
							onNavigate={ this.onNavigate( 'Jetpack Cloud Scan / History' ) }
							selected={ itemLinkMatches( '/scan/history', this.props.path ) }
						/>
					</ul>
				</ExpandableSidebarMenu>

				<SidebarItem
					label={ translate( 'Settings', {
						comment: 'Jetpack Cloud / Backups sidebar navigation item',
					} ) }
					link={ selectedSiteSlug ? settingsPath( selectedSiteSlug ) : settingsPath() }
					onNavigate={ this.onNavigate( 'Jetpack Cloud / Settings' ) }
					materialIcon="settings"
					materialIconStyle="filled"
					selected={ this.isSelected( settingsPath() ) }
				/>
			</>
		);
	}

	render() {
		const { translate, jetpackAdminUrl } = this.props;

		return (
			<Sidebar className="sidebar__jetpack-cloud">
				<SidebarRegion>
					<CurrentSite />
					{ this.sidebarItems() }
				</SidebarRegion>
				<SidebarFooter>
					<SidebarMenu>
						<SidebarItem
							label={ translate( 'Get help', {
								comment: 'Jetpack Cloud sidebar navigation item',
							} ) }
							link="https://jetpack.com/support"
							materialIcon="help"
							materialIconStyle="filled"
							onNavigate={ this.onNavigate( 'Jetpack Cloud / Support' ) }
						/>
						<SidebarItem
							label={ translate( 'WP Admin', {
								comment: 'Jetpack Cloud sidebar navigation item',
							} ) }
							link={ jetpackAdminUrl }
							icon="my-sites"
						/>
					</SidebarMenu>
				</SidebarFooter>
			</Sidebar>
		);
	}
}

// Borrowed from Calypso: /client/my-sites/sidebar/index.jsx:683
const getJetpackAdminUrl = ( state, siteId ) =>
	formatUrl( {
		...parseUrl( getSiteAdminUrl( state, siteId ) + 'admin.php' ),
		query: { page: 'jetpack' },
	} );

export default connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );
		const jetpackAdminUrl = getJetpackAdminUrl( state, siteId );

		// To be removed after jetpack/features-section flags are permanently enabled
		const isBackupSectionOpen = isSidebarSectionOpen( state, SIDEBAR_SECTION_BACKUP );
		const isScanSectionOpen = isSidebarSectionOpen( state, SIDEBAR_SECTION_SCAN );
		const threats = getSiteScanThreats( state, siteId );
		const scanProgress = getSiteScanProgress( state, siteId );
		// End to-be-removed

		return {
			jetpackAdminUrl,
			selectedSiteSlug: getSelectedSiteSlug( state ),

			// To be removed after jetpack/features-section flags are permanently enabled
			siteId,
			isBackupSectionOpen,
			isScanSectionOpen,
			threats,
			scanProgress,
			shouldShowJetpackSection: isJetpackSectionEnabledForSite( state, siteId ),
		};
	},
	{
		dispatchRecordTracksEvent: recordTracksEvent,

		// To be removed after jetpack/features-section flags are permanently enabled
		expandSection,
		toggleSection,
	}
)( localize( JetpackCloudSidebar ) );
