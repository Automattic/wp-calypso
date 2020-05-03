/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { memoize } from 'lodash';

/**
 * Internal dependencies
 */
import config from 'config';
import QueryJetpackScan from 'components/data/query-jetpack-scan';
import { getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import getSiteScanThreats from 'state/selectors/get-site-scan-threats';
import getSiteScanProgress from 'state/selectors/get-site-scan-progress';
import CurrentSite from 'my-sites/current-site';
import ExpandableSidebarMenu from 'layout/sidebar/expandable';
import { itemLinkMatches } from 'my-sites/sidebar/utils';
import ScanBadge from 'landing/jetpack-cloud/components/scan-badge';
import Sidebar from 'layout/sidebar';
import SidebarFooter from 'layout/sidebar/footer';
import SidebarItem from 'layout/sidebar/item';
import SidebarMenu from 'layout/sidebar/menu';
import SidebarRegion from 'layout/sidebar/region';
import { recordTracksEvent } from 'state/analytics/actions';
import { isSidebarSectionOpen } from 'state/my-sites/sidebar/selectors';
import {
	expandMySitesSidebarSection as expandSection,
	toggleMySitesSidebarSection as toggleSection,
} from 'state/my-sites/sidebar/actions';
import { backupMainPath, backupActivityPath } from 'landing/jetpack-cloud/sections/backups/paths';

// Lowercase because these are used as keys for sidebar state.
export const SIDEBAR_SECTION_SCAN = 'scan';
export const SIDEBAR_SECTION_BACKUP = 'backup';

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

	scrollToTop() {
		window.scrollTo( 0, 0 );
	}

	onNavigate = memoize( ( menuItem ) => () => {
		this.props.dispatchRecordTracksEvent( 'calypso_jetpack_cloud_sidebar_menuitem_click', {
			menu_item: menuItem,
		} );
		this.scrollToTop();
	} );

	render() {
		const { selectedSiteSlug, translate, threats, siteId, scanProgress } = this.props;
		const numberOfThreatsFound = threats.length;

		const scanTitle = this.props.translate( 'Scan', {
			comment: 'Jetpack Cloud / Scan sidebar navigation item',
		} );

		const scanBadge = (
			<ScanBadge progress={ scanProgress } numberOfThreatsFound={ numberOfThreatsFound } />
		);

		return (
			<Sidebar className="sidebar__jetpack-cloud">
				<SidebarRegion>
					<CurrentSite />
					{ config.isEnabled( 'jetpack-cloud/backups' ) && (
						<ExpandableSidebarMenu
							onClick={ this.toggleSection( SIDEBAR_SECTION_BACKUP ) }
							expanded={ this.props.isBackupSectionOpen }
							title={ this.props.translate( 'Backup', {
								comment: 'Jetpack Cloud / Backup sidebar navigation item',
							} ) }
							materialIcon="backup"
							materialIconStyle="filled"
						>
							<ul>
								<SidebarItem
									expandSection={ this.expandBackupSection }
									label={ translate( 'Status', {
										comment: 'Jetpack Cloud / Backup status sidebar navigation item',
									} ) }
									link={ backupMainPath( selectedSiteSlug ) }
									onNavigate={ this.onNavigate( 'Jetpack Cloud Backup / Status' ) }
									selected={
										itemLinkMatches( backupMainPath(), this.props.path ) &&
										! itemLinkMatches( backupActivityPath(), this.props.path )
									}
								/>
								<SidebarItem
									expandSection={ this.expandBackupSection }
									label={ translate( 'Activity Log', {
										comment: 'Jetpack Cloud / Activity Log status sidebar navigation item',
									} ) }
									link={ backupActivityPath( selectedSiteSlug ) }
									onNavigate={ this.onNavigate( 'Jetpack Cloud Backup / Activity Log' ) }
									selected={ itemLinkMatches( backupActivityPath(), this.props.path ) }
								/>
							</ul>
						</ExpandableSidebarMenu>
					) }
					{ config.isEnabled( 'jetpack-cloud/scan' ) && (
						<>
							<QueryJetpackScan siteId={ siteId } />
							<ExpandableSidebarMenu
								onClick={ this.toggleSection( SIDEBAR_SECTION_SCAN ) }
								expanded={ this.props.isScanSectionOpen }
								title={
									this.props.isScanSectionOpen ? (
										scanTitle
									) : (
										<>
											{ scanTitle } { scanBadge }{ ' ' }
										</>
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
										link={
											selectedSiteSlug ? `/scan/history/${ selectedSiteSlug }` : '/scan/history'
										}
										onNavigate={ this.onNavigate( 'Jetpack Cloud Scan / History' ) }
										selected={ itemLinkMatches( '/scan/history', this.props.path ) }
									/>
								</ul>
							</ExpandableSidebarMenu>
						</>
					) }
					{ config.isEnabled( 'jetpack-cloud/settings' ) && (
						<SidebarItem
							label={ translate( 'Settings', {
								comment: 'Jetpack Cloud / Backups sidebar navigation item',
							} ) }
							link={ selectedSiteSlug ? `/settings/${ selectedSiteSlug }` : '/settings' }
							onNavigate={ this.onNavigate( 'Jetpack Cloud / Settings' ) }
							materialIcon="settings"
							materialIconStyle="filled"
							selected={ this.isSelected( '/settings' ) }
						/>
					) }
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
							selected={ this.isSelected( '/support' ) }
						/>
						<SidebarItem
							forceInternalLink={ true }
							label={ translate( 'Manage site', {
								comment: 'Jetpack Cloud sidebar navigation item',
							} ) }
							link={
								selectedSiteSlug
									? `https://wordpress.com/home/${ selectedSiteSlug }`
									: 'https://wordpress.com/stats'
							}
							materialIcon="arrow_back"
							materialIconStyle="filled"
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
		const isBackupSectionOpen = isSidebarSectionOpen( state, SIDEBAR_SECTION_BACKUP );
		const isScanSectionOpen = isSidebarSectionOpen( state, SIDEBAR_SECTION_SCAN );
		const threats = getSiteScanThreats( state, siteId );
		const scanProgress = getSiteScanProgress( state, siteId );

		return {
			siteId,
			isBackupSectionOpen,
			isScanSectionOpen,
			selectedSiteSlug: getSelectedSiteSlug( state ),
			threats,
			scanProgress,
		};
	},
	{
		expandSection,
		toggleSection,
		dispatchRecordTracksEvent: recordTracksEvent,
	}
)( localize( JetpackCloudSidebar ) );
