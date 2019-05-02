/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import Main from 'components/main';
import SiteSelector from 'components/site-selector';

/**
 * Style dependencies
 */
import './style.scss';

class Sites extends Component {
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

		// No support for Gutenberg on VIP.
		if ( /^\/block-editor/.test( path ) ) {
			return ! site.is_vip;
		}

		return site;
	};

	getHeaderText() {
		if ( this.props.getSiteSelectionHeaderText ) {
			return this.props.getSiteSelectionHeaderText();
		}

		let path = this.props.siteBasePath.split( '?' )[ 0 ].split( '/' )[ 1 ];
		if ( typeof path !== 'undefined' ) {
			path = path.toLowerCase();
		}

		const { translate } = this.props;

		// nicer wording for editor routes
		const editorRouters = [ 'page', 'post', 'edit', 'block-editor' ];
		if ( editorRouters.includes( path ) ) {
			return translate( 'Select a site to start writing' );
		}

		switch ( path ) {
			case 'activity-log':
				path = translate( 'Activity' );
				break;
			case 'stats':
				path = translate( 'Insights' );
				break;
			case 'plans':
				path = translate( 'Plans' );
				break;
			case 'media':
				path = translate( 'Media' );
				break;
			case 'sharing':
				path = translate( 'Sharing' );
				break;
			case 'people':
				path = translate( 'People' );
				break;
			case 'domains':
				path = translate( 'Domains' );
				break;
			case 'settings':
				path = translate( 'Settings' );
				break;
		}

		return translate( 'Please select a site to open {{strong}}%(path)s{{/strong}}', {
			args: { path },
			components: {
				strong: <strong />,
			},
		} );
	}

	render() {
		return (
			<Main className="sites">
				<h2 className="sites__select-heading">{ this.getHeaderText() }</h2>
				<Card className="sites__select-wrapper">
					<SiteSelector
						filter={ this.filterSites }
						siteBasePath={ this.props.siteBasePath }
						groups
					/>
				</Card>
			</Main>
		);
	}
}

export default localize( Sites );
