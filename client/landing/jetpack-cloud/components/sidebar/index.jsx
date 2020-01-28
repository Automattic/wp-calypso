/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import { isExternal } from 'lib/url';
import ExpandableSidebarMenu from 'layout/sidebar/expandable';
import Sidebar from 'layout/sidebar';
import SidebarFooter from 'layout/sidebar/footer';
import SidebarItem from 'layout/sidebar/item';
import SidebarMenu from 'layout/sidebar/menu';
import SidebarRegion from 'layout/sidebar/region';

/**
 * Style dependencies
 */
import './style.scss';

const SECTIONS = [
	{
		path: '/',
		label: 'Dashboard', // @todo: Localize
		materialIcon: 'dashboard',
	},
	{
		path: '/backups',
		label: 'Backups', // @todo: Localize
		materialIcon: 'backup',
		items: [
			{
				path: '/backups',
				label: 'Backups', // @todo: Localize
			},
			{
				path: '/backups/restore',
				label: 'Restore site', // @todo: Localize
			},
			{
				path: '/backups/settings',
				label: 'Settings', // @todo: Localize
			},
		],
	},
	{
		path: '/scan',
		label: 'Scan', // @todo: Localize
		materialIcon: 'security',
		items: [
			{
				path: '/scan',
				label: 'Scanner', // @todo: Localize
			},
			{
				path: '/scan/history',
				label: 'History', // @todo: Localize
			},
			{
				path: '/scan/settings',
				label: 'Settings', // @todo: Localize
			},
		],
	},
];

const FOOTER = [
	{
		path: '/support',
		label: 'Support', // @todo: Localize
		materialIcon: 'help',
	},
	{
		path: 'https://wordpress.com', // @todo: Use some constant here
		label: 'Manage site', // @todo: Localize
		materialIcon: 'play_circle_filled',
		className: 'sidebar__menu-item-back',
	},
];

class JetpackCloudSidebar extends Component {
	static propTypes = {
		baseRoute: PropTypes.string,
		path: PropTypes.string.isRequired,
	};

	static defaultProps = {
		baseRoute: '',
	};

	state = {
		expandedSections: [ this.findInitiallyExpandedSection() ],
	};

	/**
	 * Find initially expanded section base on current path.
	 *
	 * @returns {string} Expanded section path
	 */
	findInitiallyExpandedSection() {
		const sections = [ ...SECTIONS, ...FOOTER ].map( ( { path } ) => path );
		const expandedSection = sections.find(
			section => this.props.path === this.getFullPath( section )
		);

		return expandedSection ?? sections[ 0 ];
	}

	/**
	 * Toggle an expandable section.
	 *
	 * @param {string} section Section to be toggled
	 */
	toggleSection( section ) {
		const expandedSections = this.isExpanded( section )
			? this.state.expandedSections.filter( item => item !== section )
			: [ ...this.state.expandedSections, section ];
		this.setState( { expandedSections } );
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
	 * Construct a full path which includes the base path.
	 *
	 * @param   {string} path Path for which we want a full path
	 * @returns {string}      Full path
	 */
	getFullPath( path = '' ) {
		// @todo: Once the URL structure is defined, this method may be redundant.
		// No special treatment for external links
		if ( isExternal( path ) ) {
			return path;
		}

		// Dashboard path
		if ( path === '/' ) {
			return this.props.baseRoute;
		}

		return this.props.baseRoute + path;
	}

	handleExpandableMenuClick( section ) {
		return () => this.toggleSection( section );
	}

	onNavigate = () => {
		window.scrollTo( 0, 0 );
	};

	renderMenu( item ) {
		return <SidebarMenu key={ 'menu' + item.path }>{ this.renderMenuItem( item ) }</SidebarMenu>;
	}

	renderExpandableMenu( { className, items, label, materialIcon, path } ) {
		return (
			<ExpandableSidebarMenu
				key={ 'expandable' + path }
				className={ className }
				onClick={ this.handleExpandableMenuClick( path ) }
				expanded={ this.isExpanded( path ) }
				title={ label }
				materialIcon={ materialIcon }
				materialIconStyle="filled"
			>
				<ul>{ items.map( item => this.renderMenuItem( item ) ) }</ul>
			</ExpandableSidebarMenu>
		);
	}

	renderMenuItem( { className, label, materialIcon, path } ) {
		return (
			<SidebarItem
				key={ 'item' + path }
				className={ className }
				link={ this.getFullPath( path ) }
				label={ label }
				materialIcon={ materialIcon }
				materialIconStyle="filled"
				selected={ this.props.path === this.getFullPath( path ) }
				forceInternalLink={ true }
			/>
		);
	}

	render() {
		return (
			<Sidebar>
				<SidebarRegion>
					{ /* @todo: A profile info box needs to be created and added here; similar to <ProfileGravatar /> in client/me/sidebar/index.jsx */ }
					{ SECTIONS.map( section =>
						section.items ? this.renderExpandableMenu( section ) : this.renderMenu( section )
					) }
				</SidebarRegion>
				<SidebarFooter>
					{ FOOTER.map( section =>
						section.items ? this.renderExpandableMenu( section ) : this.renderMenu( section )
					) }
				</SidebarFooter>
			</Sidebar>
		);
	}
}

export default JetpackCloudSidebar;
