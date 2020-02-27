/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { getSelectedSiteSlug } from 'state/ui/selectors';
import config from 'config';
import CurrentSite from 'my-sites/current-site';
import Sidebar from 'layout/sidebar';
import SidebarFooter from 'layout/sidebar/footer';
import SidebarItem from 'layout/sidebar/item';
import SidebarMenu from 'layout/sidebar/menu';
import SidebarRegion from 'layout/sidebar/region';

/**
 * Style dependencies
 */
import './style.scss';

class JetpackCloudSidebar extends Component {
	static propTypes = {
		path: PropTypes.string.isRequired,
		selectedSiteSlug: PropTypes.string,
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

	onNavigate = () => {
		window.scrollTo( 0, 0 );
	};

	render() {
		const { selectedSiteSlug, translate } = this.props;

		return (
			<Sidebar>
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
						<SidebarItem
							label={ translate( 'Backups', {
								comment: 'Jetpack Cloud sidebar navigation item',
							} ) }
							link={ selectedSiteSlug ? `/backups/${ selectedSiteSlug }` : '/backups' }
							onNavigate={ this.onNavigate }
							materialIcon="backup"
							materialIconStyle="filled"
							selected={ this.isSelected( '/backups' ) }
						/>
					) }
					{ config.isEnabled( 'jetpack-cloud/scan' ) && (
						<SidebarItem
							label={ translate( 'Scan', {
								comment: 'Jetpack Cloud / Scan sidebar navigation item',
							} ) }
							link={ selectedSiteSlug ? `/scan/${ selectedSiteSlug }` : '/scan' }
							onNavigate={ this.onNavigate }
							materialIcon="security" // @todo: The Scan logo differs from the Material Icon used here
							materialIconStyle="filled"
							selected={ this.isSelected( '/scan' ) }
						/>
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
						/>
					) }
				</SidebarRegion>
				<SidebarFooter>
					<SidebarMenu>
						<SidebarItem
							label={ translate( 'Support', { comment: 'Jetpack Cloud sidebar navigation item' } ) }
							link="#" // @todo: Add /support route or change link to other destination
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

export default connect( state => ( { selectedSiteSlug: getSelectedSiteSlug( state ) } ) )(
	localize( JetpackCloudSidebar )
);
