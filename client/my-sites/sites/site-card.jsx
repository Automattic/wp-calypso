/**
 * External dependencies
 */
var React = require( 'react' ),
	classNames = require( 'classnames' ),
	debug = require( 'debug' )( 'calypso:my-sites:site' ),
	photon = require( 'photon' ),
	url = require( 'url' );

/**
 * Internal dependencies
 */
var observe = require( 'lib/mixins/data-observe' ),
	route = require( 'lib/route' ),
	SiteIcon = require( 'components/site-icon' ),
	config = require( 'config' );

module.exports = React.createClass( {
	displayName: 'Site',

	mixins: [ observe( 'site' ) ],

	componentDidMount: function() {
		debug( 'Site React component mounted.' );
	},

	getHeaderImageUrl: function( site ) {
		var imageUrl = false,
			maxWidth = 300,
			parsed;

		if ( typeof site.options !== 'undefined' ) {
			// Only display header images if they are at least 300px wide
			if ( typeof site.options.header_image !== 'undefined' && site.options.header_image.width > maxWidth ) {
				imageUrl = site.options.header_image.url;

				if ( /\/\/.*\.files\.wordpress\.com/.test( imageUrl ) ) {
					imageUrl = imageUrl.replace( /^https?:/, '' );
					parsed = url.parse( imageUrl, true );
					parsed.query.w = maxWidth * 2;
					imageUrl = url.format( parsed );
				} else {
					imageUrl = photon( imageUrl ) + '?w=' + ( maxWidth * 2 );
				}
			}
		}

		return imageUrl;
	},

	getBackgroundColor: function() {
		var background;

		if ( typeof this.props.site.options !== 'undefined' && typeof this.props.site.options.background_color === 'string' ) {
			background = this.props.site.options.background_color;
		}

		return background;
	},

	siteOptions: function( site ) {
		var settings, update, statsLink, customizeUrl,
			capabilities = site.capabilities || {};

		/**
		 * Check whether the `options` array exists
		 * since some users (contributors) don't seem to have it returned
		 */
		if ( typeof site.options === 'undefined' ) {
			return;
		}

		update = ( site.update && 'error' !== site.update && site.update.total > 0 ) ? <li><a href={ site.options.admin_url + 'update-core.php' } className="update-available">{ this.translate( 'Update Available' ) }</a></li> : null;

		if ( ! site.jetpack || config.isEnabled( 'manage/jetpack' ) ) {
			settings = <a href={ '/settings/general/' + site.slug } className="site-settings">{ this.translate( 'Settings' ) }</a>;
		} else {
			settings = <a href={ '//wordpress.com/manage/' + site.ID } className="site-manage">{ this.translate( 'Manage' ) }</a>;
		}

		if ( config.isEnabled( 'manage/stats' ) ) {
			statsLink = <a href={ route.getStatsDefaultSitePage( site.slug ) }>{ this.translate( 'Stats' ) }</a>;
		} else {
			statsLink = <a href={ '//wordpress.com/my-stats/?blog=' + site.ID }>{ this.translate( 'Stats' ) }</a>;
		}

		if ( config.isEnabled( 'manage/customize' ) && ! site.jetpack ) {
			customizeUrl = '/customize/' + site.slug;
		} else {
			customizeUrl = site.options.admin_url + 'customize.php?return=' + encodeURIComponent( window.location );
		}

		return (
			<ul className="site-card__options">
				{ capabilities.manage_options ?
					<li>{ statsLink }</li>
				: null }
				{ capabilities.edit_theme_options ?
					<li><a href={ customizeUrl } className="site-design">{ this.translate( 'Customize' ) }</a></li>
				: null }
				{ update }
			</ul>
		);
	},

	render: function() {
		var site, siteClass, headerStyle, background, options, headerImageUrl;

		/**
		 * Get the site from property
		 */
		site = this.props.site;

		if ( ! site ) {
			return null;
		}

		/**
		 * Use the header image as a header banner background style if available
		 */
		headerImageUrl = this.getHeaderImageUrl( site );

		/**
		 * Get the background color if available
		 */
		background = this.getBackgroundColor();

		if ( headerImageUrl ) {
			headerStyle = {
				backgroundImage: 'url(' + headerImageUrl + ')'
			};
		} else if ( background ) {
			headerStyle = {
				backgroundColor: '#' + background
			};
		}

		/**
		 * Set site class
		 */
		siteClass = classNames(
			'site-card',
			{
				'is-jetpack': site.jetpack,
				'is-private': site.is_private,
				'has-update': site.update && ( 'error' !== site.update ) && ( site.update.total > 0 ),
				'is-selected': this.props.selected
			}
		);

		options = this.siteOptions( site );

		return (
			<a href={ route.addSiteFragment( this.props.sourcePath, this.props.site.slug ) } className={ siteClass } ref="site">
				<div className="site-card__content" ref="siteContent">
					<div className="site-card__header" style={ headerStyle } ref="siteHeader" />
					<SiteIcon site={ site } size={ 60 } />
					<h3 className="site-card__title">
						{ site.title }
					</h3>
					<p className="site-card__description" title={ site.description }>
						{ site.description ? site.description : site.domain }
					</p>
				</div>
			</a>
		);
	}
} );
