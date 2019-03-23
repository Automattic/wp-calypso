/** @format */

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
import analytics from 'lib/analytics';
import compareProps from 'lib/compare-props';
import { getSiteAdminUrl, getSiteSlug, isJetpackSite } from 'state/sites/selectors';
import { canCurrentUser as canCurrentUserStateSelector } from 'state/selectors/can-current-user';
import { itemLinkMatches } from './utils';
import { recordTracksEvent } from 'state/analytics/actions';

class ManageMenu extends PureComponent {
	static propTypes = {
		path: PropTypes.string,
		onNavigate: PropTypes.func,
		siteId: PropTypes.number,
		// connected props
		canCurrentUser: PropTypes.func,
		isJetpack: PropTypes.bool,
		siteAdminUrl: PropTypes.string,
		siteSlug: PropTypes.string,
	};

	getPluginItem() {
		const { isAtomicSite, siteSlug, translate } = this.props;
		const buttonLink = siteSlug ? `/plugins/manage/${ siteSlug }` : '/plugins/manage';

		return {
			name: 'plugins',
			label: translate( 'Plugins' ),
			capability: 'manage_options',
			queryable: ! isAtomicSite,
			config: 'manage/plugins',
			link: '/plugins',
			paths: [ '/extensions', '/plugins' ],
			wpAdminLink: 'plugin-install.php?calypsoify=1',
			showOnAllMySites: true,
			buttonLink: ! isAtomicSite ? buttonLink : '',
			buttonText: translate( 'Manage' ),
			extraIcon: isAtomicSite ? 'chevron-right' : null,
			customClassName: isAtomicSite ? 'sidebar__plugins-item' : '',
			forceInternalLink: isAtomicSite,
		};
	}

	getImportItem = () => {
		const { isJetpack, translate } = this.props;

		return {
			name: 'import',
			label: translate( 'Import' ),
			capability: 'manage_options',
			queryable: ! isJetpack,
			config: 'manage/import-in-sidebar',
			link: '/settings/import', // @TODO make it a top level section & add a redirect
			paths: [ '/settings/import' ],
			wpAdminLink: 'import.php',
			showOnAllMySites: false,
			forceInternalLink: ! isJetpack,
		};
	};

	onNavigate = postType => () => {
		if ( ! includes( [ 'post', 'page' ], postType ) ) {
			analytics.mc.bumpStat( 'calypso_publish_menu_click', postType );
		}
		this.props.recordTracksEvent( 'calypso_mysites_manage_sidebar_item_clicked', {
			menu_item: postType,
		} );
		this.props.onNavigate();
	};

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
				className={ menuItem.customClassName }
				key={ menuItem.name }
				label={ menuItem.label }
				selected={ itemLinkMatches( menuItem.paths || menuItem.link, this.props.path ) }
				link={ link }
				onNavigate={ this.onNavigate( menuItem.name ) }
				postType={ menuItem.name === 'plugins' ? null : menuItem.name }
				tipTarget={ `side-menu-${ menuItem.name }` }
				forceInternalLink={ menuItem.forceInternalLink }
			/>
		);
	}

	render() {
		const menuItems = [];

		if ( config.isEnabled( 'calypsoify/plugins' ) ) {
			menuItems.push( this.getPluginItem() );
		}

		if ( config.isEnabled( 'manage/import-in-sidebar' ) ) {
			menuItems.push( this.getImportItem() );
		}

		return <ul>{ menuItems.map( this.renderMenuItem, this ) }</ul>;
	}
}

export default connect(
	( state, { siteId } ) => ( {
		// eslint-disable-next-line wpcalypso/redux-no-bound-selectors
		canCurrentUser: partial( canCurrentUserStateSelector, state, siteId ),
		isJetpack: isJetpackSite( state, siteId ),
		// eslint-disable-next-line wpcalypso/redux-no-bound-selectors
		siteAdminUrl: getSiteAdminUrl( state, siteId ),
		siteSlug: getSiteSlug( state, siteId ),
	} ),
	{ recordTracksEvent },
	null,
	{ areStatePropsEqual: compareProps( { ignore: [ 'canCurrentUser' ] } ) }
)( localize( ManageMenu ) );
