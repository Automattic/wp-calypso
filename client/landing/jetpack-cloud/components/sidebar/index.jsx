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
import CurrentSite from '../current-site';
import ExpandableSidebarMenu from 'layout/sidebar/expandable';
import Sidebar from 'layout/sidebar';
import SidebarFooter from 'layout/sidebar/footer';
import SidebarItem from 'layout/sidebar/item';
import SidebarMenu from 'layout/sidebar/menu';
import SidebarRegion from 'layout/sidebar/region';
import { getSelectedSiteSlug } from 'state/ui/selectors';

/**
 * Style dependencies
 */
import './style.scss';

class JetpackCloudSidebar extends Component {
	static propTypes = {
		path: PropTypes.string.isRequired,
		selectedSiteSlug: PropTypes.string,
	};

	state = {
		expandedSections: this.props.path.match( /^(\/?[^/]*)/gi ), // @todo: Restore the sections state after page refresh
	};

	/**
	 * Toggle an expandable section.
	 *
	 * @param {string} path Section path
	 */
	toggleSection( path ) {
		const expandedSections = this.isExpanded( path )
			? this.state.expandedSections.filter( item => item !== path )
			: [ ...this.state.expandedSections, path ];
		this.setState( { expandedSections } );
	}

	/**
	 * Check if a menu is expanded.
	 *
	 * @param   {string}  path Section path
	 * @returns {boolean}      True if section is expanded
	 */
	isExpanded( path ) {
		return this.state.expandedSections.includes( path );
	}

	/**
	 * Check if a menu item is selected.
	 *
	 * @param   {string}  path Menu item path
	 * @returns {boolean}      True if menu item is selected
	 */
	isSelected( path ) {
		return this.props.path === path;
	}

	handleExpandableMenuClick( path ) {
		return () => this.toggleSection( path );
	}

	onNavigate = () => {
		window.scrollTo( 0, 0 );
	};

	render() {
		const { selectedSiteSlug, translate } = this.props;

		return (
			<Sidebar>
				<CurrentSite />
				<SidebarRegion>
					{ /* @todo: A profile info box needs to be created and added here; similar to <ProfileGravatar /> in client/me/sidebar/index.jsx */ }
					<SidebarMenu>
						<SidebarItem
							link="/"
							label={ translate( 'Dashboard', {
								comment: 'Jetpack Cloud sidebar navigation item',
							} ) }
							materialIcon="dashboard"
							materialIconStyle="filled"
							selected={ this.isSelected( '/' ) }
						/>
					</SidebarMenu>
					<ExpandableSidebarMenu
						expanded={ this.isExpanded( '/backups' ) }
						onClick={ this.handleExpandableMenuClick( '/backups' ) }
						materialIcon="backup"
						materialIconStyle="filled"
						title={ translate( 'Backups', { comment: 'Jetpack Cloud sidebar navigation item' } ) }
					>
						<ul>
							<SidebarItem
								label={ translate( 'Backups', {
									comment: 'Jetpack Cloud sidebar navigation item',
								} ) }
								link={ selectedSiteSlug ? `/backups/${ selectedSiteSlug }` : '/backups' }
								onNavigate={ this.onNavigate }
								selected={ this.isSelected( '/backups' ) }
							/>
							<SidebarItem
								label={ translate( 'Restore site', {
									comment: 'Jetpack Cloud / Backups sidebar navigation item',
								} ) }
								link="#" // @todo: Add /backup/restore route
								onNavigate={ this.onNavigate }
								selected={ this.isSelected( '/backups/restore' ) }
							/>
							<SidebarItem
								label={ translate( 'Settings', {
									comment: 'Jetpack Cloud / Backups sidebar navigation item',
								} ) }
								link="#" // @todo: Add backup/settings route
								onNavigate={ this.onNavigate }
								selected={ this.isSelected( '/backups/settings' ) }
							/>
						</ul>
					</ExpandableSidebarMenu>
					<ExpandableSidebarMenu
						expanded={ this.isExpanded( '/scan' ) }
						onClick={ this.handleExpandableMenuClick( '/scan' ) }
						materialIcon="security" // @todo: The Scan logo differs from the Material Icon used here
						materialIconStyle="filled"
						title={ translate( 'Scan', { comment: 'Jetpack Cloud sidebar navigation item' } ) }
					>
						<ul>
							<SidebarItem
								label={ translate( 'Scanner', {
									comment: 'Jetpack Cloud / Scan sidebar navigation item',
								} ) }
								link={ selectedSiteSlug ? `/scan/${ selectedSiteSlug }` : '/scan' }
								onNavigate={ this.onNavigate }
								selected={ this.isSelected( '/scan' ) }
							/>
							<SidebarItem
								label={ translate( 'History', {
									comment: 'Jetpack Cloud / Scan sidebar navigation item',
								} ) }
								link="#" // @todo: Add /scan/history route
								onNavigate={ this.onNavigate }
								selected={ this.isSelected( '/scan/history' ) }
							/>
							<SidebarItem
								label={ translate( 'Settings', {
									comment: 'Jetpack Cloud / Scan sidebar navigation item',
								} ) }
								link="#" // @todo: Add /scan/settings route
								onNavigate={ this.onNavigate }
								selected={ this.isSelected( '/scan/settings' ) }
							/>
						</ul>
					</ExpandableSidebarMenu>
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

export default connect( state => ( {
	selectedSiteSlug: getSelectedSiteSlug( state ),
} ) )( localize( JetpackCloudSidebar ) );
