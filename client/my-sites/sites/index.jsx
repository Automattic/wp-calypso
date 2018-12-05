/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import Main from 'components/main';
import SiteSelector from 'components/site-selector';

export class Sites extends Component {
	static propTypes = {
		siteBasePath: PropTypes.string.isRequired,
	};

	filterSites = site => {
		const path = this.props.siteBasePath;

		// Domains can be managed on Simple and Atomic sites.
		if ( /^\/domains/.test( path ) ) {
			return ! site.jetpack || site.options.is_automated_transfer;
		}

		// Plans are for not Jetpack or Jetpack upgradeable sites.
		if ( /^\/plans/.test( path ) ) {
			return ! site.jetpack || site.isSiteUpgradeable;
		}

		// No support for Gutenberg on VIP or Jetpack sites yet.
		if ( /^\/block-editor/.test( path ) ) {
			return ! site.is_vip && ! site.jetpack;
		}

		return site;
	};

	getHeaderText = () => {
		if ( this.props.getSiteSelectionHeaderText ) {
			return this.props.getSiteSelectionHeaderText();
		}

		let path = this.props.siteBasePath.split( '?' )[ 0 ].split( '/' )[ 1 ];
		if ( typeof path !== 'undefined' ) {
			path = path.toLowerCase();
		}

		switch ( path ) {
			case 'activity-log':
				path = i18n.translate( 'Activity' );
				break;
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
				path: path,
			},
			components: {
				strong: <strong />,
			},
		} );
	};

	render() {
		return (
			<Main className="sites">
				<h2 className="sites__select-heading">{ this.getHeaderText() }</h2>
				<Card className="sites__selector-wrapper">
					<SiteSelector
						filter={ this.filterSites }
						siteBasePath={ this.props.siteBasePath }
						groups={ true }
					/>
				</Card>
			</Main>
		);
	}
}

export default Sites;
