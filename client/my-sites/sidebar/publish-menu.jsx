/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { includes, omit, reduce, get, mapValues } from 'lodash';

/**
 * Internal dependencies
 */
import SidebarItem from 'layout/sidebar/item';
import SidebarButton from 'layout/sidebar/button';
import config from 'config';
import { getSelectedSite } from 'state/ui/selectors';
import { getEditorPath } from 'state/ui/editor/selectors';
import { getPostTypes } from 'state/post-types/selectors';
import QueryPostTypes from 'components/data/query-post-types';
import analytics from 'lib/analytics';
import { decodeEntities } from 'lib/formatting';
import MediaLibraryUploadButton from 'my-sites/media-library/upload-button';

const PublishMenu = React.createClass( {
	propTypes: {
		site: React.PropTypes.oneOfType( [
			React.PropTypes.object,
			React.PropTypes.bool
		] ),
		sites: React.PropTypes.object.isRequired,
		postTypes: React.PropTypes.object,
		siteSuffix: React.PropTypes.string,
		isSingle: React.PropTypes.bool,
		itemLinkClass: React.PropTypes.func,
		onNavigate: React.PropTypes.func
	},

	// We default to `/my` posts when appropriate
	getMyParameter() {
		const { sites, site } = this.props;
		if ( ! sites.initialized ) {
			return '';
		}

		if ( site ) {
			return ( site.single_user_site || site.jetpack ) ? '' : '/my';
		}

		return ( sites.allSingleSites ) ? '' : '/my';
	},

	getDefaultMenuItems() {
		const { site } = this.props;

		const items = [
			{
				name: 'post',
				label: this.translate( 'Blog Posts' ),
				className: 'posts',
				capability: 'edit_posts',
				config: 'manage/posts',
				queryable: true,
				link: '/posts' + this.getMyParameter(),
				paths: [ '/posts', '/posts/my' ],
				buttonLink: site ? '/post/' + site.slug : '/post',
				wpAdminLink: 'edit.php',
				showOnAllMySites: true,
			},
			{
				name: 'page',
				label: this.translate( 'Pages' ),
				className: 'pages',
				capability: 'edit_pages',
				queryable: true,
				config: 'manage/pages',
				link: '/pages',
				buttonLink: site ? '/page/' + site.slug : '/page',
				wpAdminLink: 'edit.php?post_type=page',
				showOnAllMySites: true,
			}
		];

		if ( config.isEnabled( 'manage/media' ) ) {
			items.push( {
				name: 'media',
				label: this.translate( 'Media' ),
				className: 'media-section',
				capability: 'upload_files',
				queryable: true,
				config: 'manage/media',
				link: '/media',
				buttonLink: '/media/' + site.slug,
				wpAdminLink: 'upload.php',
				showOnAllMySites: false,
			} );
		}
		return items;
	},

	onNavigate( postType ) {
		if ( ! includes( [ 'post', 'page' ], postType ) ) {
			analytics.mc.bumpStat( 'calypso_publish_menu_click', postType );
		}

		this.props.onNavigate();
	},

	renderMenuItem( menuItem ) {
		const { site } = this.props;
		if ( site.capabilities && ! site.capabilities[ menuItem.capability ] ) {
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
		if ( ( ! isEnabled || ! menuItem.queryable ) && site.options ) {
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
			case 'media': icon = 'image'; break;
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
				onNavigate={ this.onNavigate.bind( this, menuItem.name ) }
				icon={ icon }
				preloadSectionName={ preload }
			>
				{ menuItem.name === 'media' && (
					<MediaLibraryUploadButton site={ site } href={ menuItem.buttonLink }>{ this.translate( 'Add' ) }</MediaLibraryUploadButton>
				) }
				{ menuItem.name !== 'media' && (
					<SidebarButton href={ menuItem.buttonLink } preloadSectionName="post-editor">{ this.translate( 'Add' ) }</SidebarButton>
				) }
			</SidebarItem>
		);
	},

	getCustomMenuItems() {
		const customPostTypes = omit( this.props.postTypes, [ 'post', 'page' ] );
		return reduce( customPostTypes, ( memo, postType, postTypeSlug ) => {
			// `show_ui` was added in Jetpack 4.5, so explicitly check false
			// value in case site on earlier version where property is omitted
			if ( false === postType.show_ui ) {
				return memo;
			}

			let buttonLink;
			if ( config.isEnabled( 'manage/custom-post-types' ) && postType.api_queryable ) {
				buttonLink = this.props.postTypeLinks[ postTypeSlug ];
			}

			return memo.concat( {
				name: postType.name,
				label: decodeEntities( get( postType.labels, 'menu_name', postType.label ) ),
				className: postType.name,
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
				buttonLink
			} );
		}, [] );
	},

	render() {
		const menuItems = [
			...this.getDefaultMenuItems(),
			...this.getCustomMenuItems()
		];

		return (
			<ul>
				{ this.props.site && (
					<QueryPostTypes siteId={ this.props.site.ID } />
				) }
				{ menuItems.map( this.renderMenuItem ) }
			</ul>
		);
	}
} );

export default connect( ( state ) => {
	const siteId = get( getSelectedSite( state ), 'ID' );
	const postTypes = getPostTypes( state, siteId );

	return {
		postTypes,
		postTypeLinks: mapValues( postTypes, ( postType, postTypeSlug ) => {
			return getEditorPath( state, siteId, null, postTypeSlug );
		} )
	};
}, null, null, { pure: false } )( PublishMenu );
