/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import page from 'page';
import i18n from 'i18n-calypso';
import { startsWith } from 'lodash';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import Main from 'components/main';
import observe from 'lib/mixins/data-observe';
import SiteSelector from 'components/site-selector';
import { addSiteFragment } from 'lib/route';
import { getSiteFragment } from 'lib/route/path';
import { getSites } from 'state/selectors';
import { getSiteSlug } from 'state/sites/selectors';
import { getSelectedSite } from 'state/ui/selectors';

export const Sites = React.createClass( {
	displayName: 'Sites',

	mixins: [ observe( 'user' ) ],

	propTypes: {
		path: React.PropTypes.string.isRequired
	},

	componentWillMount() {
		// If we have a selected site already, and an un-registered
		// path we want to handle, do a redirect rather than show
		// the site site selector.
		if ( this.props.selectedSite ) {
			const siteFragment = getSiteFragment( page.current );
			const path = this.props.path.toLowerCase().split( '?' )[ 0 ].split( '/' )[ 1 ];

			switch ( path ) {
				case 'sites':
					page.redirect( `/stats/insights/${ siteFragment }` );
					break;
				case 'settings':
					page.redirect( `/settings/general/${ siteFragment }` );
					break;
			}
		}
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

		let path = this.props.path.split( '?' )[ 0 ].split( '/' )[ 1 ];
		if ( typeof path !== 'undefined' ) {
			path = path.toLowerCase();
		}

		switch ( path ) {
			case 'stats':
				path = i18n.translate( 'Insights' );
				break;
			case 'plans':
				path = i18n.translate( 'Plans' );
				break;
			case 'media':
				path = i18n.translate( 'Media' );
				break;
			case 'sharing':
				path = i18n.translate( 'Sharing' );
				break;
			case 'people':
				path = i18n.translate( 'People' );
				break;
			case 'domains':
				path = i18n.translate( 'Domains' );
				break;
			case 'settings':
				path = i18n.translate( 'Settings' );
				break;
		}

		return i18n.translate( 'Please select a site to open {{strong}}%(path)s{{/strong}}', {
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
	let path = rawPath.toLowerCase();

	if ( startsWith( path, '/sites' ) ) {
		path = '/stats/insights';
	}

	if ( startsWith( path, '/settings' ) ) {
		path = '/settings/general';
	}

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
