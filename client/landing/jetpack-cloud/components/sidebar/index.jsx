/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import ExpandableSidebarMenu from 'layout/sidebar/expandable';
import Sidebar from 'layout/sidebar';
import SidebarFooter from 'layout/sidebar/footer';
import SidebarItem from 'layout/sidebar/item';
import SidebarMenu from 'layout/sidebar/menu';
import SidebarRegion from 'layout/sidebar/region';
import CurrentSite from 'my-sites/current-site';

/**
 * Style dependencies
 */
import './style.scss';

class JetpackCloudSidebar extends Component {
	static propTypes = {
		path: PropTypes.string.isRequired,
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
		return (
			<Sidebar>
				<SidebarRegion>
					<CurrentSite />
					{ /* @todo: A profile info box needs to be created and added here; similar to <ProfileGravatar /> in client/me/sidebar/index.jsx */ }
					<SidebarMenu>
						<SidebarItem
							link="/"
							label="Dashboard" // @todo: Localize
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
						title="Backups" // @todo: Localize
					>
						<ul>
							<SidebarItem
								label="Backups" // @todo: Localize
								link="/backups"
								onNavigate={ this.onNavigate }
								selected={ this.isSelected( '/backups' ) }
							/>
							<SidebarItem
								label="Restore site" // @todo: Localize
								link="#" // @todo: Add /backup/restore route
								onNavigate={ this.onNavigate }
								selected={ this.isSelected( '/backups/restore' ) }
							/>
							<SidebarItem
								label="Settings" // @todo: Localize
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
						title="Scan" // @todo: Localize
					>
						<ul>
							<SidebarItem
								label="Scanner" // @todo: Localize
								link="/scan"
								onNavigate={ this.onNavigate }
								selected={ this.isSelected( '/scan' ) }
							/>
							<SidebarItem
								label="History" // @todo: Localize
								link="#" // @todo: Add /scan/history route
								onNavigate={ this.onNavigate }
								selected={ this.isSelected( '/scan/history' ) }
							/>
							<SidebarItem
								label="Settings" // @todo: Localize
								link="#" // @todo: Add /scan/settings route
								onNavigate={ this.onNavigate }
								selected={ this.isSelected( '/scan/settings' ) }
							/>
						</ul>
					</ExpandableSidebarMenu>
					<SidebarItem
						label="Plugins" // @todo: Localize
						link="/plugins"
						onNavigate={ this.onNavigate }
						selected={ this.isSelected( '/plugins' ) }
					/>
				</SidebarRegion>
				<SidebarFooter>
					<SidebarMenu>
						<SidebarItem
							label="Support" // @todo: Localize
							link="#" // @todo: Add /support route or change link to other destination
							materialIcon="help"
							materialIconStyle="filled"
							onNavigate={ this.onNavigate }
							selected={ this.isSelected( '/support' ) }
						/>
						<SidebarItem
							forceInternalLink={ true }
							label="Manage site" // @todo: Localize
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

export default JetpackCloudSidebar;
