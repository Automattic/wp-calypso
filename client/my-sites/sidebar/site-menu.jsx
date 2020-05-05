/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { compact, includes, omit, reduce, get, partial } from 'lodash';
import { localize } from 'i18n-calypso';
import config from 'config';

/**
 * Internal dependencies
 */
import SidebarItem from 'layout/sidebar/item';
import { getPostTypes } from 'state/post-types/selectors';
import QueryPostTypes from 'components/data/query-post-types';
import { bumpStat } from 'lib/analytics/mc';
import { decodeEntities } from 'lib/formatting';
import compareProps from 'lib/compare-props';
import {
	getSite,
	getSiteAdminUrl,
	getSiteSlug,
	isJetpackSite,
	isSingleUserSite,
} from 'state/sites/selectors';
import isSiteWpcomAtomic from 'state/selectors/is-site-wpcom-atomic';
import areAllSitesSingleUser from 'state/selectors/are-all-sites-single-user';
import { canCurrentUser as canCurrentUserStateSelector } from 'state/selectors/can-current-user';
import { itemLinkMatches } from './utils';
import { recordTracksEvent } from 'state/analytics/actions';
import isVipSite from 'state/selectors/is-vip-site';
import { SIDEBAR_SECTION_SITE } from 'my-sites/sidebar/constants';
import { expandMySitesSidebarSection as expandSection } from 'state/my-sites/sidebar/actions';
import isSiteWPForTeams from 'state/selectors/is-site-wpforteams';

class SiteMenu extends PureComponent {
	static propTypes = {
		path: PropTypes.string,
		onNavigate: PropTypes.func,
		siteId: PropTypes.number,
		// connected props
		allSingleSites: PropTypes.bool,
		canCurrentUser: PropTypes.func,
		isJetpack: PropTypes.bool,
		isSiteAtomic: PropTypes.bool,
		isSingleUser: PropTypes.bool,
		postTypes: PropTypes.object,
		siteAdminUrl: PropTypes.string,
		site: PropTypes.oneOfType( [ PropTypes.object, PropTypes.bool ] ),
		siteSlug: PropTypes.string,
		isSiteWPForTeams: PropTypes.bool,
	};

	// We default to `/my` posts when appropriate
	getMyParameter() {
		const { allSingleSites, isJetpack, isSingleUser, siteId } = this.props;

		if ( siteId ) {
			return isSingleUser || isJetpack ? '' : '/my';
		}

		// FIXME: If you clear `IndexedDB` and land on a site that has yourself as its only user,
		// and then navigate to multi-site mode, the `areAllSites` predicate will return true,
		// as long as no other sites have been fetched into Redux state. As a consequence, the
		// 'Posts' link will point to `/posts` (instead of `/posts/my` as it should, when you have
		// sites with other users).
		// The fix will be to make sure all sites are fetched into Redux state, see
		// https://github.com/Automattic/wp-calypso/pull/13094
		return allSingleSites ? '' : '/my';
	}

	getDefaultMenuItems() {
		const { translate } = this.props;

		return [
			{
				name: 'page',
				label: translate( 'Pages' ),
				capability: 'edit_pages',
				queryable: true,
				link: '/pages',
				wpAdminLink: 'edit.php?post_type=page',
				showOnAllMySites: true,
			},
			{
				name: 'post',
				label: translate( 'Posts' ),
				capability: 'edit_posts',
				config: 'manage/posts',
				queryable: true,
				link: '/posts' + this.getMyParameter(),
				paths: [ '/posts', '/posts/my' ],
				wpAdminLink: 'edit.php',
				showOnAllMySites: true,
			},
			{
				name: 'media',
				label: translate( 'Media' ),
				capability: 'edit_posts',
				queryable: true,
				link: '/media',
				wpAdminLink: 'upload.php',
				showOnAllMySites: false,
			},
			{
				name: 'comments',
				label: translate( 'Comments' ),
				capability: 'edit_posts',
				queryable: true,
				config: 'manage/comments',
				link: '/comments',
				paths: [ '/comment', '/comments' ],
				wpAdminLink: 'edit-comments.php',
				showOnAllMySites: false,
			},
		];
	}

	onNavigate = ( postType ) => () => {
		if ( ! includes( [ 'post', 'page' ], postType ) ) {
			bumpStat( 'calypso_publish_menu_click', postType );
		}
		this.props.recordTracksEvent( 'calypso_mysites_site_sidebar_item_clicked', {
			menu_item: postType,
		} );
		this.props.onNavigate();
	};

	expandSiteSection = () => this.props.expandSection( SIDEBAR_SECTION_SITE );

	renderMenuItem( menuItem ) {
		const { canCurrentUser, siteId, siteAdminUrl } = this.props;

		if ( siteId && ! canCurrentUser( menuItem.capability ) ) {
			return null;
		}

		// Hide the sidebar link for media
		if ( 'attachment' === menuItem.name ) {
			return null;
		}

		// Hide Full Site Editing templates CPT. This shouldn't be editable directly.
		if ( 'wp_template_part' === menuItem.name ) {
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

		let preload;
		if ( 'post' === menuItem.name ) {
			preload = 'posts';
		} else if ( 'page' === menuItem.name ) {
			preload = 'pages';
		} else if ( 'comments' === menuItem.name ) {
			preload = 'comments';
		} else {
			preload = 'posts-custom';
		}

		return (
			<SidebarItem
				key={ menuItem.name }
				label={ menuItem.label }
				selected={ itemLinkMatches( menuItem.paths || menuItem.link, this.props.path ) }
				link={ link }
				onNavigate={ this.onNavigate( menuItem.name ) }
				preloadSectionName={ preload }
				postType={ menuItem.name === 'plugins' ? null : menuItem.name }
				tipTarget={ `side-menu-${ menuItem.name }` }
				forceInternalLink={ menuItem.forceInternalLink }
				expandSection={ this.expandSiteSection }
			/>
		);
	}

	getCustomMenuItems() {
		const { isVip, isJetpack, isSiteAtomic } = this.props;
		//reusable blocks are not shown in the sidebar on wp-admin either
		const customPostTypes = omit( this.props.postTypes, [ 'post', 'page', 'wp_block' ] );
		return reduce(
			customPostTypes,
			( memo, postType, postTypeSlug ) => {
				// `show_ui` was added in Jetpack 4.5, so explicitly check false
				// value in case site on earlier version where property is omitted
				if ( false === postType.show_ui ) {
					return memo;
				}

				// Hide "Feedback" for WP for Teams sites.
				if (
					config.isEnabled( 'signup/wpforteams' ) &&
					this.props.isSiteWPForTeams &&
					postTypeSlug === 'feedback'
				) {
					return memo;
				} else if ( postTypeSlug === 'feedback' ) {
					//Special handling for feedback (contact form entries), let's calypsoify except for VIP
					//It doesn't make sense for the author to use the generic CPT handling in Calypso

					return memo.concat( {
						name: postType.name,
						label: decodeEntities( get( postType.labels, 'menu_name', postType.label ) ),
						config: 'manage/custom-post-types',
						//controls if we show the wp-admin link. It feels like this is coupling two different meanings (api_queryable)
						queryable: false,

						//If the API endpoint doesn't send the .capabilities property (e.g. because the site's Jetpack
						//version isn't up-to-date), silently assume we don't have the capability to edit this CPT.
						capability: get( postType.capabilities, 'edit_posts' ),

						// Required to build the menu item class name. Must be discernible from other
						// items' paths in the same section for item highlighting to work properly.
						link: '/types/' + postType.name,
						// don't calypsoify for VIP or Jetpack
						wpAdminLink:
							isVip || ( isJetpack && ! isSiteAtomic )
								? 'edit.php?post_type=feedback&calypsoify=0'
								: 'edit.php?post_type=feedback&calypsoify=1',
						showOnAllMySites: false,
					} );
				}

				return memo.concat( {
					name: postType.name,
					label: decodeEntities( get( postType.labels, 'menu_name', postType.label ) ),
					config: 'manage/custom-post-types',
					queryable: postType.api_queryable,

					//If the API endpoint doesn't send the .capabilities property (e.g. because the site's Jetpack
					//version isn't up-to-date), silently assume we don't have the capability to edit this CPT.
					capability: get( postType.capabilities, 'edit_posts' ),

					// Required to build the menu item class name. Must be discernible from other
					// items' paths in the same section for item highlighting to work properly.
					link: '/types/' + postType.name,
					wpAdminLink: 'edit.php?post_type=' + postType.name,
					showOnAllMySites: false,
				} );
			},
			[]
		);
	}

	render() {
		const menuItems = [ ...this.getDefaultMenuItems(), ...this.getCustomMenuItems() ];

		return (
			<ul>
				{ this.props.siteId && <QueryPostTypes siteId={ this.props.siteId } /> }
				{ menuItems.map( this.renderMenuItem, this ) }
			</ul>
		);
	}
}

export default connect(
	( state, { siteId } ) => ( {
		allSingleSites: areAllSitesSingleUser( state ),
		// eslint-disable-next-line wpcalypso/redux-no-bound-selectors
		canCurrentUser: partial( canCurrentUserStateSelector, state, siteId ),
		isJetpack: isJetpackSite( state, siteId ),
		isSiteAtomic: isSiteWpcomAtomic( state, siteId ),
		isSingleUser: isSingleUserSite( state, siteId ),
		postTypes: getPostTypes( state, siteId ),
		siteAdminUrl: getSiteAdminUrl( state, siteId ),
		site: getSite( state, siteId ),
		siteSlug: getSiteSlug( state, siteId ),
		isVip: isVipSite( state, siteId ),
		isSiteWPForTeams: isSiteWPForTeams( state, siteId ),
	} ),
	{ expandSection, recordTracksEvent },
	null,
	{ areStatePropsEqual: compareProps( { ignore: [ 'canCurrentUser' ] } ) }
)( localize( SiteMenu ) );
