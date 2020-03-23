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
import {
	expandMySitesSidebarSection as expandSection,
	toggleMySitesSidebarSection as toggleSection,
} from 'state/my-sites/sidebar/actions';
import { getSelectedSiteSlug, getSelectedSiteId } from 'state/ui/selectors';
import { isSidebarSectionOpen } from 'state/my-sites/sidebar/selectors';
import { itemLinkMatches } from 'my-sites/sidebar/utils';
import Badge from 'components/badge';
import config from 'config';
import CurrentSite from 'my-sites/current-site';
import ExpandableSidebarMenu from 'layout/sidebar/expandable';
import getRewindState from 'state/selectors/get-rewind-state';
import getRewindStateRequestStatus from 'state/selectors/get-rewind-state-request-status';
import QueryRewindState from 'components/data/query-rewind-state';
import Sidebar from 'layout/sidebar';
import SidebarFooter from 'layout/sidebar/footer';
import SidebarItem from 'layout/sidebar/item';
import SidebarMenu from 'layout/sidebar/menu';
import SidebarRegion from 'layout/sidebar/region';

// Lowercase because these are used as keys for sidebar state.
export const SIDEBAR_SECTION_SCAN = 'scan';
export const SIDEBAR_SECTION_BACKUP = 'backup';

/**
 * Style dependencies
 */
import './style.scss';

class JetpackCloudSidebar extends Component {
	static propTypes = {
		path: PropTypes.string.isRequired,
		selectedSiteSlug: PropTypes.string,
		threats: PropTypes.array,
		siteId: PropTypes.number,
	};

	/**
	 * Check if a menu item is selected.
	 *
	 * @param {string} path Menu item path
	 * @param {boolean} allowStartsWith A path is considered selected if the current path starts with the given one
	 * @returns {boolean}      True if menu item is selected
	 */
	isSelected( path, allowStartsWith = true ) {
		return this.props.path === path || ( allowStartsWith && this.props.path.startsWith( path ) );
	}

	expandScanSection = () => this.props.expandSection( SIDEBAR_SECTION_SCAN );
	expandBackupSection = () => this.props.expandSection( SIDEBAR_SECTION_BACKUP );

	toggleSection = memoize( id => () => this.props.toggleSection( id ) );

	onNavigate = () => {
		window.scrollTo( 0, 0 );
	};

	render() {
		const { selectedSiteSlug, settingsIssues, siteId, translate, threats } = this.props;
		const numberOfThreatsFound = threats.length;

		return (
			<Sidebar className="sidebar__jetpack-cloud">
				{ siteId && <QueryRewindState siteId={ siteId } /> }
				<SidebarRegion>
					<CurrentSite />
					<SidebarMenu>
						<SidebarItem
							link="/"
							label={ translate( 'Dashboard', {
								comment: 'Jetpack Cloud sidebar navigation item',
							} ) }
							materialIcon="dashboard"
							materialIconStyle="filled"
							selected={ this.isSelected( '/', false ) }
						/>
					</SidebarMenu>
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
									label={ translate( 'Status', {
										comment: 'Jetpack Cloud / Backup status sidebar navigation item',
									} ) }
									link={ selectedSiteSlug ? `/backups/${ selectedSiteSlug }` : '/backups' }
									onNavigate={ this.onNavigate }
									selected={ itemLinkMatches( '/backups', this.props.path ) }
								/>
								<SidebarItem
									label={ translate( 'Activity Log', {
										comment: 'Jetpack Cloud / Activity Log status sidebar navigation item',
									} ) }
									link={ selectedSiteSlug ? `/activity/${ selectedSiteSlug }` : '/activity' }
									onNavigate={ this.onNavigate }
									selected={ itemLinkMatches( '/activity', this.props.path ) }
								/>
							</ul>
						</ExpandableSidebarMenu>
					) }
					{ config.isEnabled( 'jetpack-cloud/scan' ) && (
						<ExpandableSidebarMenu
							onClick={ this.toggleSection( SIDEBAR_SECTION_SCAN ) }
							expanded={ this.props.isScanSectionOpen }
							title={ this.props.translate( 'Scan', {
								comment: 'Jetpack Cloud / Scan sidebar navigation item',
							} ) }
							materialIcon="security" // @todo: The Scan logo differs from the Material Icon used here
							materialIconStyle="filled"
						>
							<ul>
								<SidebarItem
									label={ translate( 'Scanner', {
										comment: 'Jetpack Cloud / Scanner sidebar navigation item',
									} ) }
									link={ selectedSiteSlug ? `/scan/${ selectedSiteSlug }` : '/scan' }
									onNavigate={ this.onNavigate }
									selected={
										itemLinkMatches( '/scan', this.props.path ) &&
										! itemLinkMatches( '/scan/history', this.props.path )
									}
								>
									{ numberOfThreatsFound > 0 && (
										<Badge type="error">
											{ translate( '%(number)d threat', '%(number)d threats', {
												count: numberOfThreatsFound,
												args: {
													number: numberOfThreatsFound,
												},
											} ) }
										</Badge>
									) }
								</SidebarItem>
								<SidebarItem
									label={ translate( 'History', {
										comment: 'Jetpack Cloud / Scan History sidebar navigation item',
									} ) }
									link={
										selectedSiteSlug ? `/scan/history/${ selectedSiteSlug }` : '/scan/history'
									}
									onNavigate={ this.onNavigate }
									selected={ itemLinkMatches( '/scan/history', this.props.path ) }
								/>
							</ul>
						</ExpandableSidebarMenu>
					) }
					{ config.isEnabled( 'jetpack-cloud/settings' ) && (
						<SidebarItem
							label={ translate( 'Settings', {
								comment: 'Jetpack Cloud / Backups sidebar navigation item',
							} ) }
							link={ selectedSiteSlug ? `/settings/${ selectedSiteSlug }` : '/settings' }
							onNavigate={ this.onNavigate }
							materialIcon="settings"
							materialIconStyle="filled"
							selected={ this.isSelected( '/settings' ) }
						>
							{ settingsIssues.length > 0 && <Badge type="error">{ settingsIssues.length }</Badge> }
						</SidebarItem>
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
							onNavigate={ this.onNavigate }
							selected={ this.isSelected( '/support' ) }
						/>
						<SidebarItem
							forceInternalLink={ true }
							label={ translate( 'Manage site', {
								comment: 'Jetpack Cloud sidebar navigation item',
							} ) }
							link="https://wordpress.com/stats" // @todo: Confirm a correct link is used here
							materialIcon="arrow_back"
							materialIconStyle="filled"
						/>
					</SidebarMenu>
				</SidebarFooter>
			</Sidebar>
		);
	}
}

// This has to be replaced for a real selector once we load the
// threats information into our Redux store.
const getSiteThreats = () => {
	return [ {}, {} ];
};

export default connect(
	state => {
		const isBackupSectionOpen = isSidebarSectionOpen( state, SIDEBAR_SECTION_BACKUP );
		const isScanSectionOpen = isSidebarSectionOpen( state, SIDEBAR_SECTION_SCAN );
		const threats = getSiteThreats( state );
		const siteId = getSelectedSiteId( state );
		const rewindState = getRewindState( state, siteId );
		const rewindStateRequestStatus = getRewindStateRequestStatus( state, siteId );

		const settingsIssues = [];

		if ( rewindStateRequestStatus === 'success' && rewindState?.state !== 'active' ) {
			settingsIssues.push( 'not-connected' );
		}

		return {
			isBackupSectionOpen,
			isScanSectionOpen,
			selectedSiteSlug: getSelectedSiteSlug( state ),
			settingsIssues,
			siteId,
			threats,
		};
	},
	{
		expandSection,
		toggleSection,
	}
)( localize( JetpackCloudSidebar ) );
