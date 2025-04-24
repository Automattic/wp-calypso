import { Card, Button } from '@automattic/components';
import clsx from 'clsx';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import VisitSite from 'calypso/blocks/visit-site';
import DocumentHead from 'calypso/components/data/document-head';
import Main from 'calypso/components/main';
import SiteSelector from 'calypso/components/site-selector';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import getSites from 'calypso/state/selectors/get-sites';
import hasLoadedSites from 'calypso/state/selectors/has-loaded-sites';
import { hasJetpackActivePlugins, isJetpackSitePred } from 'calypso/state/sites/selectors';

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
		isPostShare: PropTypes.bool,
	};

	componentDidMount() {
		const path = this.getPath();
		recordTracksEvent( 'calypso_site_selector_view', {
			path,
			is_post_share: this.props.isPostShare,
		} );

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
		if ( hasJetpackActivePlugins( site ) && ! isJetpackSiteOrJetpackCloud( site ) ) {
			return false;
		}

		if ( site.is_deleted ) {
			return false;
		}

		const path = this.props.siteBasePath;

		// Domains can be managed on Simple and Atomic sites.
		if ( /^\/domains/.test( path ) ) {
			if ( site?.is_wpcom_staging_site ) {
				return false;
			}
			return ! site.jetpack || site.options?.is_automated_transfer;
		}

		// If a site is Jetpack, plans are available only when it is upgradeable.
		if ( /^\/plans/.test( path ) ) {
			if ( site?.is_wpcom_staging_site ) {
				return false;
			}
			return ! site.jetpack || site.capabilities.manage_options;
		}

		if ( /^\/hosting-config/.test( path ) ) {
			// allow both Atomic sites and Simple sites, so they can be exposed to upgrade notices.
			// Note: This is a deprecated path, superceded by /hosting-features/ or /sites/settings/server/ as of 2025 April.
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
		const initialPath = path;

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
				path = translate( 'Stats' );
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
			case 'hosting-overview':
				path = translate( 'Hosting Overview' );
				break;
			case 'jetpack-search':
				path = 'Jetpack Search';
				break;
			case 'site-monitoring':
				path = translate( 'Site Monitoring' );
				break;
			case 'github-deployments':
				path = translate( 'GitHub Deployments' );
				break;
			case 'earn':
				path = translate( 'Monetize' );
				break;
			case 'subscribers':
				path = translate( 'Subscribers' );
				break;
			case 'themes':
				path = translate( 'Themes' );
				break;
			case 'marketing':
				path = translate( 'Marketing' );
				break;
			case 'import':
				path = translate( 'Import' );
				break;
			case 'export':
				path = translate( 'Export' );
				break;
			case 'email':
				path = translate( 'Emails' );
				break;
			case 'purchases':
				path = translate( 'Purchases' );
				break;
			case 'customize':
				path = translate( 'Customizer' );
				break;
			case 'google-my-business':
				path = translate( 'Google Business Profile' );
				break;
			case 'view':
				path = translate( 'Preview' );
				break;
			case 'woocommerce-installation':
				path = 'WooCommerce';
				break;
			case 'store':
				path = translate( 'Store' );
				break;
			case 'add-ons':
				path = translate( 'Add-ons' );
				break;
		}
		// We don't have a translated path, capitalize the provided path.
		const capitalize = initialPath === path;

		return translate( 'Select a site to open {{strong}}%(path)s{{/strong}}', {
			args: { path },
			components: {
				strong: <strong className={ clsx( { 'strong--capitalize': capitalize } ) } />,
			},
		} );
	}

	render() {
		const { clearPageTitle, fromSite, siteBasePath, sites, translate, hasFetchedSites } =
			this.props;
		const filteredSites = sites.filter( this.filterSites );

		// Show empty content only on Jetpack Cloud
		const showEmptyContent = isJetpackCloud() && hasFetchedSites && ! filteredSites.length;

		return (
			<>
				{ clearPageTitle && <DocumentHead title="" /> }
				<Main className={ clsx( 'sites', { 'sites__main-empty': showEmptyContent } ) }>
					{ showEmptyContent ? (
						<div className="sites__empty-state">
							<h1 className="card-heading-36">{ translate( 'Add a site' ) }</h1>
							<p>
								{ translate(
									'It looks like you don’t have any connected Jetpack sites to manage.'
								) }
							</p>
							<Button
								primary
								target="_blank"
								href="https://jetpack.com/support/jetpack-agency-licensing-portal-instructions/add-sites-agency-portal-dashboard/"
							>
								{ translate( 'Learn how to add a site' ) }
							</Button>
						</div>
					) : (
						<>
							<div className="sites__select-header">
								<h2 className="sites__select-heading">{ this.getHeaderText() }</h2>
								{ fromSite && <VisitSite siteSlug={ fromSite } /> }
							</div>
							<Card className="sites__select-wrapper">
								<SiteSelector filter={ this.filterSites } siteBasePath={ siteBasePath } groups />
							</Card>
						</>
					) }
				</Main>
			</>
		);
	}
}

export default connect( ( state ) => {
	return {
		hasFetchedSites: hasLoadedSites( state ),
		sites: getSites( state, false ),
	};
} )( localize( Sites ) );
