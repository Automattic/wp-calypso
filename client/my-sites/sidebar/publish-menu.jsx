/**
 * External dependencies
 */
var React = require( 'react' ),
	some = require( 'lodash/some' );

/**
 * Internal dependencies
 */
var SidebarItem = require( 'layout/sidebar/item' ),
	config = require( 'config' ),
	postTypesList = require( 'lib/post-types-list' )();

var PublishMenu = React.createClass( {

	propTypes: {
		site: React.PropTypes.oneOfType( [
			React.PropTypes.object,
			React.PropTypes.bool
		] ),
		sites: React.PropTypes.object.isRequired,
		siteSuffix: React.PropTypes.string,
		isSingle: React.PropTypes.oneOfType( [
			React.PropTypes.string,
			React.PropTypes.bool
		] ),
		itemLinkClass: React.PropTypes.func,
		onNavigate: React.PropTypes.func,
	},

	// We default to `/my` posts when appropriate
	getMyParameter: function( selectedSite ) {
		var sites = this.props.sites;
		if ( ! sites.initialized ) {
			return '';
		}
		if ( selectedSite ) {
			return ( selectedSite.single_user_site || selectedSite.jetpack ) ? '' : '/my';
		}
		return ( sites.allSingleSites ) ? '' : '/my';
	},

	getNewPageLink: function( site ) {
		if ( config.isEnabled( 'post-editor/pages' ) ) {
			return site ? '/page/' + site.slug : '/page';
		}
		return site ? '//wordpress.com/page/' + site.ID + '/new' : '//wordpress.com/page';
	},

	getDefaultMenuItems: function( site ) {
		var newPostLink;

		if ( config.isEnabled( 'post-editor' ) ) {
			newPostLink = site ? '/post/' + site.slug : '/post';
		} else {
			newPostLink = site ? '//wordpress.com/post/' + site.ID + '/new' : '//wordpress.com/post';
		}

		return [
			{
				name: 'post',
				label: this.translate( 'Blog Posts' ),
				className: 'posts',
				capability: 'edit_posts',
				config: 'manage/posts',
				link: '/posts' + this.getMyParameter( site ),
				paths: [ '/posts', '/posts/my' ],
				buttonLink: newPostLink,
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
				buttonLink: this.getNewPageLink( site ),
				wpAdminLink: 'edit.php?post_type=page',
				showOnAllMySites: true,
			}
		];
	},

	getPostTypes: function( site ) {
		if ( ! site ) {
			return { postTypes: [] };
		}

		return { postTypes: postTypesList.get( site.ID ) };
	},

	getInitialState: function() {
		return this.getPostTypes( this.props.site );
	},

	componentDidMount: function() {
		postTypesList.on( 'change', this.update );
	},

	componentWillUnmount: function() {
		postTypesList.off( 'change', this.update );
	},

	componentWillReceiveProps: function( nextProps ) {
		if ( this.props.site !== nextProps.site ) {
			this.setState( this.getPostTypes( nextProps.site ) );
		}
	},

	update: function() {
		this.setState( this.getPostTypes( this.props.site ) );
	},

	renderMenuItem: function( menuItem ) {
		var className = this.props.itemLinkClass(
				menuItem.paths ? menuItem.paths : menuItem.link,
				menuItem.className
			),
			isEnabled = config.isEnabled( menuItem.config ),
			link,
			icon;

		if ( this.props.site.capabilities && ! this.props.site.capabilities[ menuItem.capability ] ) {
			return null;
		}

		// Hide the sidebar link for media
		if ( 'attachment' === menuItem.name ) {
			return null;
		}

		// Hide the sidebar link for multiple site view if it's not in calypso, or
		// if it opts not to be shown.
		if ( ! this.props.isSingle && ( ! isEnabled || ! menuItem.showOnAllMySites ) ) {
			return null;
		}

		if ( ! isEnabled && this.props.site.options ) {
			link = this.props.site.options.admin_url + menuItem.wpAdminLink;
		} else {
			link = menuItem.link + this.props.siteSuffix;
		}

		let preload;

		if ( menuItem.name === 'post' ) {
			icon = 'posts';
			preload = 'posts-pages';
		} else if ( menuItem.name === 'page' ) {
			icon = 'pages';
			preload = 'posts-pages';
		} else if ( menuItem.name === 'jetpack-portfolio' ) {
			icon = 'folder';
		} else if ( menuItem.name === 'jetpack-testimonial' ) {
			icon = 'quote';
		} else {
			icon = 'custom-post-type';
		}

		return (
			<SidebarItem key={ menuItem.name }
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

	render: function() {
		var menuItems = this.getDefaultMenuItems( this.props.site ),
			customMenuItems,
			customPostTypes;

		customPostTypes = this.state.postTypes.filter( function( type ) {
			return ! some( menuItems, { name: type.name } );
		} );

		customMenuItems = customPostTypes.map( function( postType ) {
			return {
				name: postType.slug,
				label: postType.name,
				className: postType.slug,

				//If the API endpoint doesn't send the .capabilities property (e.g. because the site's Jetpack
				//version isn't up-to-date), silently assume we don't have the capability to edit this CPT.
				capability: ( postType.capabilities || {} ).edit_posts,

				// Dummy - doesn't exist yet, so wpAdminLink will be used
				config: 'manage/cpts',

				// Required to build the menu item class name. Must be discernible from other
				// items' paths in the same section for item highlighting to work properly.
				link: '/' + postType.slug,
				buttonLink: '',
				wpAdminLink: 'edit.php?post_type=' + postType.slug,
				showOnAllMySites: false,
			};
		} );

		menuItems = menuItems.concat( customMenuItems );

		return (
			<ul>
				{ menuItems.map( this.renderMenuItem ) }
			</ul>
		);
	}
} );

module.exports = PublishMenu;
