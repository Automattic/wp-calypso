/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import page from 'page';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import Main from 'components/main';
import SiteSelector from 'components/site-selector';
import { addSiteFragment } from 'lib/route';
import { getSelectedSite } from 'state/ui/selectors';
import { isJetpackSite } from 'state/sites/selectors';
import isPrivateSite from 'state/selectors/is-private-site';
import isSiteUpgradeable from 'state/selectors/is-site-upgradeable';

class Sites extends Component {
	static propTypes = {
		getSiteSelectionHeaderText: PropTypes.func,
		isJetpackSite: PropTypes.func.isRequired,
		isPrivateSite: PropTypes.func.isRequired,
		isSiteUpgradeable: PropTypes.func.isRequired,
		path: PropTypes.string.isRequired,
		selectedSite: PropTypes.oneOfType( [
			PropTypes.object,
			PropTypes.bool
		] ),
	};

	constructor() {
		super();
		this.filterSites = this.filterSites.bind( this );
		this.onSiteSelect = this.onSiteSelect.bind( this );
	}

	filterSites( site ) {
		let path = this.props.path;

		// Override the path to be /sites so that when a site is
		// selected the filterbar is operates as if we're on /sites
		if ( this.props.selectedSite ) {
			path = '/sites';
		}

		// Filters sites based on public or private nature
		// for paths `/public` and `/private` only
		if ( path === '/sites/private' ) {
			return this.props.isPrivateSite( site );
		}

		// Filter out jetpack sites when on particular routes
		if ( /^\/menus/.test( path ) || /^\/customize/.test( path ) ) {
			return ! this.props.isJetpackSite( site );
		}

		// Filter out sites with no upgrades on particular routes
		if ( /^\/domains/.test( path ) || /^\/plans/.test( this.props.sourcePath ) ) {
			return this.props.isSiteUpgradeable( site ) !== false;
		}

		return site;
	}

	onSiteSelect( slug ) {
		let path = this.props.path;
		if ( path === '/sites' ) {
			path = '/stats/insights';
		}
		page( addSiteFragment( path, slug ) );
	}

	getHeaderText() {
		if ( this.props.getSiteSelectionHeaderText ) {
			return this.props.getSiteSelectionHeaderText();
		}

		const path = this.props.path.split( '?' )[ 0 ].replace( /\//g, ' ' );

		return this.props.translate( 'Please select a site to open {{strong}}%(path)s{{/strong}}', {
			args: {
				path: path
			},
			components: {
				strong: <strong />
			}
		} );
	}

	render() {
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
}

export default connect(
	( state ) => ( {
		selectedSite: getSelectedSite( state ),
		isPrivateSite: ( site ) => isPrivateSite( state, site.ID ),
		isJetpackSite: ( site ) => isJetpackSite( state, site.ID ),
		isSiteUpgradeable: ( site ) => isSiteUpgradeable( state, site.ID ),
	} )
)( localize( Sites ) );
