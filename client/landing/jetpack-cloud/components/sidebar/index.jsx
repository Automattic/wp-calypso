/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import Sidebar from 'layout/sidebar';
import SidebarFooter from 'layout/sidebar/footer';
import SidebarItem from 'layout/sidebar/item';
import SidebarMenu from 'layout/sidebar/menu';
import SidebarRegion from 'layout/sidebar/region';
import ExpandableSidebarMenu from 'layout/sidebar/expandable';

class JetpackCloudSidebar extends Component {
	static propTypes = {
		context: PropTypes.shape( {
			path: PropTypes.string,
		} ),
	};

	state = {
		expandedSections: [],
	};

	componentDidMount() {
		const section = this.getSectionFromCurrentPath();

		if ( section ) {
			this.toggleSection( section );
		}
	}

	/**
	 * Get current section name from path. When there's no section, we're in the dashboard.
	 *
	 * @returns {string} Current section
	 */
	getSectionFromCurrentPath() {
		// If no section is present in the path, return 'dashboard'
		return this.props.context.path.split( '/' )[ 2 ] ?? 'dashboard';
	}

	/**
	 * Get current subsection name from path.
	 *
	 * @returns {string|null} Current subsection or null
	 */
	getSubsectionFromCurrentPath() {
		return this.props.context.path.split( '/' )[ 3 ] ?? null;
	}

	/**
	 * Toggle an expandable section.
	 *
	 * @param   {string} section Section to be toggled
	 * @returns {void}
	 */
	toggleSection( section ) {
		if ( this.isExpanded( section ) ) {
			this.setState( {
				expandedSections: this.state.expandedSections.filter( item => item !== section ),
			} );
		} else {
			this.setState( {
				expandedSections: [ ...this.state.expandedSections, section ],
			} );
		}
	}

	/**
	 * Check if a section menu is expanded.
	 *
	 * @param   {string} section Section name
	 * @returns {boolean}        Is the section expanded
	 */
	isExpanded( section ) {
		return this.state.expandedSections.includes( section );
	}

	/**
	 * Check if a menu item is selected based on the current path.
	 *
	 * @param   {string}  path Menu item path
	 * @returns {boolean}      Is the menu item selected
	 */
	isSelected( path ) {
		const section = this.getSectionFromCurrentPath();
		const subsection = this.getSubsectionFromCurrentPath();

		if ( ! subsection ) {
			return section === path;
		}

		return section.concat( '/', subsection ) === path;
	}

	handleExpandableMenuClick( section ) {
		return () => this.toggleSection( section );
	}

	onNavigate = () => {
		window.scrollTo( 0, 0 );
	};

	render() {
		return (
			<Sidebar>
				<SidebarRegion>
					{ /* @todo: A profile info box needs to be created and added here; similar to <ProfileGravatar /> in client/me/sidebar/index.jsx */ }
					<SidebarMenu>
						<ul>
							<SidebarItem
								link="/jetpack-cloud"
								label="Dashboard"
								materialIcon="dashboard"
								materialIconStyle="filled"
								selected={ this.isSelected( 'dashboard' ) }
							/>
							<ExpandableSidebarMenu
								onClick={ this.handleExpandableMenuClick( 'backups' ) }
								expanded={ this.isExpanded( 'backups' ) }
								title="Backups"
								materialIcon="backup"
								materialIconStyle="filled"
							>
								<SidebarItem
									link="/jetpack-cloud/backups"
									label="Backups"
									onNavigate={ this.onNavigate }
									selected={ this.isSelected( 'backups' ) }
								/>
								<SidebarItem
									link="/jetpack-cloud/backups/restore" // @todo: Add jetpack-cloud/backup/restore route
									label="Restore site"
									onNavigate={ this.onNavigate }
									selected={ this.isSelected( 'backups/restore' ) }
								/>
								<SidebarItem
									link="/jetpack-cloud/backups/settings" // @todo: Add jetpack-cloud/backup/settings route
									label="Settings"
									onNavigate={ this.onNavigate }
									selected={ this.isSelected( 'backups/settings' ) }
								/>
							</ExpandableSidebarMenu>
							<ExpandableSidebarMenu
								onClick={ this.handleExpandableMenuClick( 'scan' ) }
								expanded={ this.isExpanded( 'scan' ) }
								title="Scan"
								materialIcon="security" // @todo: the Scan logo differs from the Material Icon used here
								materialIconStyle="filled"
							>
								<SidebarItem
									link="/jetpack-cloud/scan"
									label="Scanner"
									onNavigate={ this.onNavigate }
									selected={ this.isSelected( 'scan' ) }
								/>
								<SidebarItem
									link="/jetpack-cloud/scan/history" // @todo: Add jetpack-cloud/scan/history route
									label="History"
									onNavigate={ this.onNavigate }
									selected={ this.isSelected( 'scan/history' ) }
								/>
								<SidebarItem
									link="/jetpack-cloud/scan/settings" // @todo: Add jetpack-cloud/scan/settings route
									label="Settings"
									onNavigate={ this.onNavigate }
									selected={ this.isSelected( 'scan/settings' ) }
								/>
							</ExpandableSidebarMenu>
						</ul>
					</SidebarMenu>
				</SidebarRegion>
				<SidebarFooter>
					<SidebarMenu>
						<ul>
							<SidebarItem
								link="/jetpack-cloud/support" // @todo: Add jetpack-cloud/support route or change linkt to other destination
								label="Support"
								materialIcon="help"
								materialIconStyle="filled"
								onNavigate={ this.onNavigate }
							/>
							<SidebarItem
								link="/"
								label="Manage site"
								materialIcon="play_circle_filled" // @todo: The icon has to be mirrored in CSS e.g. with `scaleX( -1 )`
								materialIconStyle="filled"
								onNavigate={ this.onNavigate }
							/>
						</ul>
					</SidebarMenu>
				</SidebarFooter>
			</Sidebar>
		);
	}
}

export default JetpackCloudSidebar;
