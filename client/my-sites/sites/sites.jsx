/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import page from 'page';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import Main from 'components/main';
import observe from 'lib/mixins/data-observe';
import SiteSelector from 'components/site-selector';
import { addSiteFragment } from 'lib/route';
import { getSites } from 'state/selectors';
import { getSiteSlug } from 'state/sites/selectors';
import { getSelectedSite } from 'state/ui/selectors';

export const Sites = React.createClass( {
	displayName: 'Sites',

	mixins: [ observe( 'user' ) ],

	propTypes: {
		path: React.PropTypes.string.isRequired
	},

	filterSites( site ) {
		let path = this.props.path;

		// Override the path to be /sites so that when a site is
		// selected the filterbar operates as if we're on /sites
		if ( this.props.selectedSite ) {
			path = '/sites';
		}

		// Filters sites based on public or private nature
		// for paths `/public` and `/private` only
		if ( path === '/sites/private' ) {
			return site.is_private;
		}

		// Filter out jetpack sites when on particular routes
		if ( /^\/customize/.test( path ) ) {
			return ! site.jetpack;
		}

		// Filter out sites with no upgrades on particular routes
		if ( /^\/domains/.test( path ) || /^\/plans/.test( this.props.sourcePath ) ) {
			return ! site.isJetpack || site.isSiteUpgradable;
		}

		return site;
	},

	onSiteSelect: function( siteId ) {
		this.props.selectSite( siteId, this.props.path );
		return true;
	},

	getHeaderText() {
		if ( this.props.getSiteSelectionHeaderText ) {
			return this.props.getSiteSelectionHeaderText();
		}

		let path = this.props.path.split( '?' )[ 0 ].replace( /\//g, ' ' );

		switch ( path.toLowerCase().trim() ) {
			case 'insights':
			case 'stats insights':
				path = this.translate( 'Insights' );
				break;
		}

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
						autoFocus={ true }
						filter={ this.filterSites }
						onSiteSelect={ this.onSiteSelect }
						sites={ this.props.sites }
						groups={ true }
					/>
				</Card>
			</Main>
		);
	}
} );

const selectSite = ( siteId, rawPath ) => ( dispatch, getState ) => {
	const path = ( rawPath === '/sites' )
		? '/stats/insights'
		: rawPath;
	page( addSiteFragment( path, getSiteSlug( getState(), siteId ) ) );
};

export default connect(
	( state ) => {
		return {
			selectedSite: getSelectedSite( state ),
			sites: getSites( state ),
		};
	},
	{ selectSite }
)( Sites );
