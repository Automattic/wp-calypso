/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import { connect } from 'react-redux';
import page from 'page';
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import Main from 'components/main';
import SiteSelector from 'components/site-selector';
import { addSiteFragment } from 'lib/route';

export const Sites = createReactClass( {
	displayName: 'Sites',

	propTypes: {
		path: PropTypes.string.isRequired,
	},

	filterSites( site ) {
		let path = this.props.path;

		// Filter out jetpack sites when on particular routes
		if ( /^\/customize/.test( path ) ) {
			return ! site.jetpack;
		}

		// Filter out sites with no upgrades on particular routes
		if ( /^\/domains/.test( path ) || /^\/plans/.test( this.props.basePath ) ) {
			return ! site.isJetpack || site.isSiteUpgradable;
		}

		return site;
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
				if ( '/stats/activity' === this.props.path ) {
					path = i18n.translate( 'Activity' );
				}
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
				path: path,
			},
			components: {
				strong: <strong />,
			},
		} );
	},

	render: function() {
		return (
			<Main className="sites">
				<h2 className="sites__select-heading">{ this.getHeaderText() }</h2>
				<Card className="sites__selector-wrapper">
					<SiteSelector
						autoFocus={ true }
						filter={ this.filterSites }
						siteBasePath={ this.props.siteBasePath }
						groups={ true }
					/>
				</Card>
			</Main>
		);
	},
} );

export default connect()( Sites );
