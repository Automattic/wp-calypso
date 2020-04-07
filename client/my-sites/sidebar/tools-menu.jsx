/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { compact, includes, partial } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import SidebarItem from 'layout/sidebar/item';
import config from 'config';
import { bumpStat } from 'lib/analytics/mc';
import compareProps from 'lib/compare-props';
import { getSiteAdminUrl, getSiteSlug, isJetpackSite } from 'state/sites/selectors';
import { canCurrentUser as canCurrentUserStateSelector } from 'state/selectors/can-current-user';
import canCurrentUserManagePlugins from 'state/selectors/can-current-user-manage-plugins';
import { itemLinkMatches } from './utils';
import { recordTracksEvent } from 'state/analytics/actions';
import { expandMySitesSidebarSection as expandSection } from 'state/my-sites/sidebar/actions';
import { SIDEBAR_SECTION_TOOLS } from 'my-sites/sidebar/constants';
import isSiteWPForTeams from 'state/selectors/is-site-wpforteams';

class ToolsMenu extends PureComponent {
	static propTypes = {
		path: PropTypes.string,
		onNavigate: PropTypes.func,
		siteId: PropTypes.number,
		// connected props
		canCurrentUser: PropTypes.func,
		isJetpack: PropTypes.bool,
		siteAdminUrl: PropTypes.string,
		siteSlug: PropTypes.string,
		isSiteWPForTeams: PropTypes.bool,
	};

	getPluginItem() {
		const { canManagePlugins, isAtomicSite, translate } = this.props;

		if ( config.isEnabled( 'signup/wpforteams' ) && this.props.isSiteWPForTeams ) {
			return {};
		}

		return {
			name: 'plugins',
			label: translate( 'Plugins' ),
			capability: 'manage_options',
			queryable: ! config.isEnabled( 'calypsoify/plugins' ) || ! isAtomicSite,
			config: 'manage/plugins',
			link: '/plugins',
			paths: [ '/extensions', '/plugins' ],
			wpAdminLink: 'plugin-install.php?calypsoify=1',
			showOnAllMySites: canManagePlugins,
		};
	}

	getImportItem() {
		const { isJetpack, isAtomicSite, translate } = this.props;

		const migrateEnabled = config.isEnabled( 'tools/migrate' );

		return {
			name: 'import',
			label: translate( 'Import' ),
			capability: 'manage_options',
			queryable: ! isJetpack || ( isAtomicSite && migrateEnabled ),
			link: '/import',
			paths: [ '/import', '/migrate' ],
			wpAdminLink: 'import.php',
		};
	}

	getExportItem() {
		const { isJetpack, translate } = this.props;

		return {
			name: 'export',
			label: translate( 'Export' ),
			capability: 'manage_options',
			queryable: ! isJetpack,
			link: '/export',
			paths: [ '/export' ],
			wpAdminLink: 'export.php',
		};
	}

	onNavigate = postType => () => {
		if ( ! includes( [ 'post', 'page' ], postType ) ) {
			bumpStat( 'calypso_publish_menu_click', postType );
		}
		this.props.recordTracksEvent( 'calypso_mysites_tools_sidebar_item_clicked', {
			menu_item: postType,
		} );
		this.props.onNavigate();
	};

	expandToolsSection = () => this.props.expandSection( SIDEBAR_SECTION_TOOLS );

	renderMenuItem( menuItem ) {
		const { canCurrentUser, siteId, siteAdminUrl } = this.props;

		if ( siteId && ! canCurrentUser( menuItem.capability ) ) {
			return null;
		}

		// Hide the sidebar link for multiple site view if it's not in calypso, or
		// if it opts not to be shown.
		const isEnabled = ! menuItem.config || config.isEnabled( menuItem.config );
		if ( ! siteId && ( ! isEnabled || ! menuItem.showOnAllMySites ) ) {
			return null;
		}

		let link;
		if ( ( ! isEnabled || ! menuItem.queryable ) && siteAdminUrl ) {
			link = siteAdminUrl + menuItem.wpAdminLink;
		} else {
			link = compact( [ menuItem.link, this.props.siteSlug ] ).join( '/' );
		}

		return (
			<SidebarItem
				key={ menuItem.name }
				label={ menuItem.label }
				selected={ itemLinkMatches( menuItem.paths || menuItem.link, this.props.path ) }
				link={ link }
				onNavigate={ this.onNavigate( menuItem.name ) }
				postType={ menuItem.name === 'plugins' ? null : menuItem.name }
				tipTarget={ `side-menu-${ menuItem.name }` }
				expandSection={ this.expandToolsSection }
			/>
		);
	}

	render() {
		const menuItems = [ this.getPluginItem(), this.getImportItem(), this.getExportItem() ];

		return <ul>{ menuItems.map( this.renderMenuItem, this ) }</ul>;
	}
}

export default connect(
	( state, { siteId } ) => ( {
		canManagePlugins: canCurrentUserManagePlugins( state ),
		// eslint-disable-next-line wpcalypso/redux-no-bound-selectors
		canCurrentUser: partial( canCurrentUserStateSelector, state, siteId ),
		isJetpack: isJetpackSite( state, siteId ),
		// eslint-disable-next-line wpcalypso/redux-no-bound-selectors
		siteAdminUrl: getSiteAdminUrl( state, siteId ),
		siteSlug: getSiteSlug( state, siteId ),
		isSiteWPForTeams: isSiteWPForTeams( state, siteId ),
	} ),
	{ expandSection, recordTracksEvent },
	null,
	{ areStatePropsEqual: compareProps( { ignore: [ 'canCurrentUser' ] } ) }
)( localize( ToolsMenu ) );
