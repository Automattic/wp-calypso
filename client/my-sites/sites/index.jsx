/**
 * External dependencies
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Card } from '@automattic/components';
import Main from 'components/main';
import SiteSelector from 'components/site-selector';
import VisitSite from 'blocks/visit-site';

/**
 * Style dependencies
 */
import './style.scss';

class Sites extends Component {
	static propTypes = {
		siteBasePath: PropTypes.string.isRequired,
	};

	filterSites = ( site ) => {
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

		if ( /^\/hosting-config/.test( path ) ) {
			if ( ! site.capabilities.view_hosting ) {
				return false;
			}

			// allow both Atomic sites and Simple sites, so they can be exposed to upgrade notices.
			return true;
		}

		// Supported on Simple and Atomic Sites
		if ( /^\/home/.test( path ) ) {
			return ! site.is_vip && ! ( site.jetpack && ! site.options.is_automated_transfer );
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
			case 'home':
				path = translate( 'My Home' );
				break;
			case 'hosting-config':
				path = translate( 'Hosting Configuration' );
				break;
		}

		return translate( 'Select a site to open {{strong}}%(path)s{{/strong}}', {
			args: { path },
			components: {
				strong: <strong />,
			},
		} );
	}

	render() {
		return (
			<Main className="sites">
				<div className="sites__select-header">
					<h2 className="sites__select-heading">{ this.getHeaderText() }</h2>
					{ this.props.fromSite && <VisitSite siteSlug={ this.props.fromSite } /> }
				</div>
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
