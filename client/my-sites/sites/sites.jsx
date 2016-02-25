/**
 * External dependencies
 */
var React = require( 'react' ),
	debug = require( 'debug' )( 'calypso:manage' );

import page from 'page';

/**
 * Internal dependencies
 */
var SiteCard = require( './site-card' ),
	SearchCard = require( 'components/search-card' ),
	Gridicon = require( 'components/gridicon' ),
	Main = require( 'components/main' ),
	infiniteScroll = require( 'lib/mixins/infinite-scroll' ),
	observe = require( 'lib/mixins/data-observe' ),
	config = require( 'config' );

import SiteSelector from 'components/site-selector';
import { addSiteFragment } from 'lib/route';

module.exports = React.createClass( {
	displayName: 'Sites',

	mixins: [ observe( 'sites', 'user' ) ],

	propTypes: {
		path: React.PropTypes.string.isRequired
	},

	getSiteCount: function() {
		var user, sites;
		if ( ! this.props.sites.initialized ) {
			user = this.props.user.get();
			return user.visible_site_count;
		}

		sites = this.props.sites.getVisible();
		return sites.length;
	},

	filterSites: function( site ) {
		let path = this.props.path;

		// Override the path to be /sites so that when a site is
		// selected the filterbar is operates as if we're on /sites
		if ( this.props.sites.selected ) {
			path = '/sites';
		}

		/**
		 * Filters sites based on public or private nature
		 * for paths `/public` and `/private` only
		 */
		if ( path === '/sites/private' ) {
			return site.is_private;
		}

		// filter out jetpack sites when on particular routes
		if ( /^\/menus/.test( path ) || /^\/customize/.test( path ) ) {
			return ! site.jetpack;
		}

		// filter out sites with no upgrades on particular routes
		if ( /^\/domains/.test( path ) || /^\/plans/.test( this.props.sourcePath ) ) {
			return site.isUpgradeable();
		}

		return site;
	},

	onSiteSelect: function( slug ) {
		page.replace( addSiteFragment( this.props.path, slug ) );
	},

	render: function() {
		var sitesMarkup,
			siteSelectionHeaderText = this.translate( 'Please Select a Site:' ),
			sitesTruncated;

		if ( this.props.getSiteSelectionHeaderText ) {
			siteSelectionHeaderText = this.props.getSiteSelectionHeaderText();
		}

		return (
			<Main className="sites">
				<h2 className="sites__select-heading">{ siteSelectionHeaderText }</h2>
				<SiteSelector
					filter={ ( site ) => this.filterSites( site ) }
					onSiteSelect={ this.onSiteSelect }
					sites={ this.props.sites }
				/>
			</Main>
		);
	}
} );
