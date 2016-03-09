/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import includes from 'lodash/includes';
import omit from 'lodash/omit';
import map from 'lodash/map';
import get from 'lodash/get';

/**
 * Internal dependencies
 */
import SidebarItem from 'layout/sidebar/item';
import config from 'config';
import { getSelectedSite } from 'state/ui/selectors';
import { getPostTypes } from 'state/post-types/selectors';
import QueryPostTypes from 'components/data/query-post-types';

const PublishMenu = React.createClass( {
	propTypes: {
		site: React.PropTypes.oneOfType( [
			React.PropTypes.object,
			React.PropTypes.bool
		] ),
		siteId: React.PropTypes.number,
		sites: React.PropTypes.object.isRequired,
		postTypes: React.PropTypes.object,
		siteSuffix: React.PropTypes.string,
		isSingle: React.PropTypes.oneOfType( [
			React.PropTypes.string,
			React.PropTypes.bool
		] ),
		itemLinkClass: React.PropTypes.func,
		onNavigate: React.PropTypes.func,
	},

	// We default to `/my` posts when appropriate
	getMyParameter( selectedSite ) {
		const sites = this.props.sites;
		if ( ! sites.initialized ) {
			return '';
		}

		if ( selectedSite ) {
			return ( selectedSite.single_user_site || selectedSite.jetpack ) ? '' : '/my';
		}

		return ( sites.allSingleSites ) ? '' : '/my';
	},

	getDefaultMenuItems() {
		return [
			{
				name: 'post',
				label: this.translate( 'Blog Posts' ),
				className: 'posts',
				capability: 'edit_posts',
				config: 'manage/posts',
				link: '/posts' + this.getMyParameter( this.props.site ),
				paths: [ '/posts', '/posts/my' ],
				buttonLink: this.props.site ? '/post/' + this.props.site.slug : '/post',
				wpAdminLink: 'edit.php',
				showOnAllMySites: true,
			},
			{
				name: 'page',
				label: this.translate( 'Pages' ),
				className: 'pages',
				capability: 'edit_pages',
				config: 'manage/pages',
				link: '/pages',
				buttonLink: this.props.site ? '/page/' + this.props.site.slug : '/page',
				wpAdminLink: 'edit.php?post_type=page',
				showOnAllMySites: true,
			}
		];
	},

	renderMenuItem( menuItem ) {
		if ( this.props.site.capabilities && ! this.props.site.capabilities[ menuItem.capability ] ) {
			return null;
		}

		// Hide the sidebar link for media
		if ( 'attachment' === menuItem.name ) {
			return null;
		}

		// Hide the sidebar link for multiple site view if it's not in calypso, or
		// if it opts not to be shown.
		const isEnabled = config.isEnabled( menuItem.config );
		if ( ! this.props.isSingle && ( ! isEnabled || ! menuItem.showOnAllMySites ) ) {
			return null;
		}

		let link;
		if ( ! isEnabled && this.props.site.options ) {
			link = this.props.site.options.admin_url + menuItem.wpAdminLink;
		} else {
			link = menuItem.link + this.props.siteSuffix;
		}

		let preload;
		if ( includes( [ 'post', 'page' ], menuItem.name ) ) {
			preload = 'posts-pages';
		} else {
			preload = 'posts-custom';
		}

		let icon;
		switch ( menuItem.name ) {
			case 'post': icon = 'posts'; break;
			case 'page': icon = 'pages'; break;
			case 'jetpack-portfolio': icon = 'folder'; break;
			case 'jetpack-testimonial': icon = 'quote'; break;
			default: icon = 'custom-post-type';
		}

		const className = this.props.itemLinkClass(
			menuItem.paths ? menuItem.paths : menuItem.link,
			menuItem.className
		);

		return (
			<SidebarItem
				key={ menuItem.name }
				label={ menuItem.label }
				className={ className }
				link={ link }
				buttonLink={ menuItem.buttonLink }
				onNavigate={ this.props.onNavigate }
				icon={ icon }
				preloadSectionName={ preload }
			/>
		);
	},

	getCustomMenuItems() {
		const customPostTypes = omit( this.props.postTypes, [ 'post', 'page' ] );
		return map( customPostTypes, function( postType ) {
			return {
				name: postType.name,
				label: get( postType.labels, 'menu_name', postType.label ),
				className: postType.name,

				//If the API endpoint doesn't send the .capabilities property (e.g. because the site's Jetpack
				//version isn't up-to-date), silently assume we don't have the capability to edit this CPT.
				capability: get( postType.capabilities, 'edit_posts' ),

				// Dummy - doesn't exist yet, so wpAdminLink will be used
				config: 'manage/cpts',

				// Required to build the menu item class name. Must be discernible from other
				// items' paths in the same section for item highlighting to work properly.
				link: '/' + postType.name,
				buttonLink: '',
				wpAdminLink: 'edit.php?post_type=' + postType.name,
				showOnAllMySites: false
			};
		} );
	},

	render() {
		const menuItems = [
			...this.getDefaultMenuItems(),
			...this.getCustomMenuItems()
		];

		return (
			<ul>
				<QueryPostTypes siteId={ this.props.siteId } />
				{ menuItems.map( this.renderMenuItem ) }
			</ul>
		);
	}
} );

export default connect( ( state ) => {
	const siteId = get( getSelectedSite( state ), 'ID' );
	return {
		siteId,
		postTypes: getPostTypes( state, siteId )
	};
}, null, null, { pure: false } )( PublishMenu );
