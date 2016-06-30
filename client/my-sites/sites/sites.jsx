/**
 * External dependencies
 */
import React from 'react';
import page from 'page';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import Main from 'components/main';
import observe from 'lib/mixins/data-observe';
import SiteSelector from 'components/site-selector';
import { addSiteFragment } from 'lib/route';
import { preventWidows } from 'lib/formatting';

export default React.createClass( {
	displayName: 'Sites',

	mixins: [ observe( 'sites', 'user' ) ],

	propTypes: {
		path: React.PropTypes.string.isRequired
	},

	filterSites( site ) {
		let path = this.props.path;

		// Override the path to be /sites so that when a site is
		// selected the filterbar is operates as if we're on /sites
		if ( this.props.sites.selected ) {
			path = '/sites';
		}

		// Filters sites based on public or private nature
		// for paths `/public` and `/private` only
		if ( path === '/sites/private' ) {
			return site.is_private;
		}

		// Filter out jetpack sites when on particular routes
		if ( /^\/menus/.test( path ) || /^\/customize/.test( path ) ) {
			return ! site.jetpack;
		}

		// Filter out sites with no upgrades on particular routes
		if ( /^\/domains/.test( path ) || /^\/plans/.test( this.props.sourcePath ) ) {
			return site.isUpgradeable();
		}

		return site;
	},

	onSiteSelect: function( slug ) {
		let path = this.props.path;
		if ( path === '/sites' ) {
			path = '/stats/insights';
		}
		page( addSiteFragment( path, slug ) );
	},

	getHeaderText() {
		if ( this.props.getSiteSelectionHeaderText ) {
			return this.props.getSiteSelectionHeaderText();
		}

		const path = this.props.path.split( '?' )[ 0 ].replace( /\//g, ' ' );

		return this.translate( 'Please select a site to open {{strong}}%(path)s{{/strong}}', {
			args: {
				path: path
			},
			components: {
				strong: <strong />
			}
		} );
	},

	render: function() {
		return (
			<Main className="sites">
				<h2 className="sites__select-heading">
					{ this.getHeaderText() }
				</h2>
				<Card className="sites__selector-wrapper">
					<SiteSelector
						filter={ ( site ) => this.filterSites( site ) }
						onSiteSelect={ this.onSiteSelect }
						sites={ this.props.sites }
						groups={ true }
					/>
				</Card>
			</Main>
		);
	}
} );
