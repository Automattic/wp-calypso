import { Card } from '@automattic/components';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import VisitSite from 'calypso/blocks/visit-site';
import DocumentHead from 'calypso/components/data/document-head';
import Main from 'calypso/components/main';
import SiteSelector from 'calypso/components/site-selector';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import { getJetpackActivePlugins, isJetpackSitePred } from 'calypso/state/sites/selectors';

/**
 * In order to decide whether to show the site in site selector,
 * we need to know if the site has full Jetpack plugin installed,
 * or if we are on Jetpack Cloud and the site has a Jetpack Standalone plugin installed.
 */
const isJetpackSiteOrJetpackCloud = isJetpackSitePred( {
	considerStandaloneProducts: isJetpackCloud(),
} );

import './style.scss';

class Sites extends Component {
	static propTypes = {
		siteBasePath: PropTypes.string.isRequired,
		clearPageTitle: PropTypes.bool,
	};

	componentDidMount() {
		const path = this.getPath();
		if ( this.props.fromSite && path ) {
			recordTracksEvent( 'calypso_site_selector_site_missing', {
				path,
				site: this.props.fromSite,
			} );
		}
	}

	filterSites = ( site ) => {
		// Filter out the sites on WPCOM that don't have full Jetpack plugin installed
		// Such sites should work fine on Jetpack Cloud
		if ( getJetpackActivePlugins( site ) && ! isJetpackSiteOrJetpackCloud( site ) ) {
			return false;
		}
		const path = this.props.siteBasePath;

		// Domains can be managed on Simple and Atomic sites.
		if ( /^\/domains/.test( path ) ) {
			return ! site.jetpack || site.options.is_automated_transfer;
		}

		// If a site is Jetpack, plans are available only when it is upgradeable.
		if ( /^\/plans/.test( path ) ) {
			return ! site.jetpack || site.capabilities.manage_options;
		}

		if ( /^\/hosting-config/.test( path ) ) {
			if ( ! site.capabilities.view_hosting ) {
				return false;
			}

			// allow both Atomic sites and Simple sites, so they can be exposed to upgrade notices.
			return true;
		}

		// filter out all VIP sites
		if ( /^\/home/.test( path ) ) {
			return ! site.is_vip;
		}

		return site;
	};

	/**
	 * Get the site path the user is trying to access.
	 *
	 * @returns {string} The path.
	 */
	getPath() {
		let path = this.props.siteBasePath.split( '?' )[ 0 ].split( '/' )[ 1 ];
		if ( typeof path !== 'undefined' ) {
			path = path.toLowerCase();
		}

		return path;
	}

	getHeaderText() {
		if ( this.props.getSiteSelectionHeaderText ) {
			return this.props.getSiteSelectionHeaderText();
		}

		let path = this.getPath();

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
				path = translate( 'Users' );
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
			case 'jetpack-search':
				path = 'Jetpack Search';
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
		const { clearPageTitle, fromSite, siteBasePath } = this.props;

		return (
			<>
				{ clearPageTitle && <DocumentHead title="" /> }
				<Main className="sites">
					<div className="sites__select-header">
						<h2 className="sites__select-heading">{ this.getHeaderText() }</h2>
						{ fromSite && <VisitSite siteSlug={ fromSite } /> }
					</div>
					<Card className="sites__select-wrapper">
						<SiteSelector filter={ this.filterSites } siteBasePath={ siteBasePath } groups />
					</Card>
				</Main>
			</>
		);
	}
}

export default localize( Sites );
