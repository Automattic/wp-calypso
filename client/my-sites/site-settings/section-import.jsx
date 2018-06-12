/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { isEnabled } from 'config';
import { find } from 'lodash';

/**
 * Internal dependencies
 */
import CompactCard from 'components/card/compact';
import EmptyContent from 'components/empty-content';
import ImporterStore, { getState as getImporterState } from 'lib/importer/store';
import Interval, { EVERY_FIVE_SECONDS } from 'lib/interval';
import WordPressImporter from 'my-sites/importer/importer-wordpress';
import MediumImporter from 'my-sites/importer/importer-medium';
import BloggerImporter from 'my-sites/importer/importer-blogger';
import SiteImporter from 'my-sites/importer/importer-site-importer';
import { fetchState } from 'lib/importer/actions';
import { appStates, WORDPRESS, MEDIUM, BLOGGER, SITE_IMPORTER } from 'state/imports/constants';
import EmailVerificationGate from 'components/email-verification/email-verification-gate';
import { getSelectedSite, getSelectedSiteSlug } from 'state/ui/selectors';
import Main from 'components/main';
import HeaderCake from 'components/header-cake';
import Placeholder from 'my-sites/site-settings/placeholder';

const hasActiveImports = imports =>
	!! find( imports, ( { importerState } ) => {
		return importerState !== appStates.INACTIVE && importerState !== appStates.READY_FOR_UPLOAD;
	} );

class SiteSettingsImport extends Component {
	static propTypes = {
		site: PropTypes.object,
	};

	state = getImporterState();

	componentDidMount() {
		ImporterStore.on( 'change', this.updateState );
		this.updateFromAPI();
	}

	componentWillUnmount() {
		ImporterStore.off( 'change', this.updateState );
	}

	/**
	 * Finds the import status objects for a
	 * particular type of importer
	 *
	 * @param {enum} type ImportConstants.IMPORT_TYPE_*
	 * @returns {Array<Object>} ImportStatus objects
	 */
	getImports( type ) {
		const {
			api: { isHydrated },
			importers,
		} = this.state;
		const { site } = this.props;
		const { slug, title } = site;
		const siteTitle = title.length ? title : slug;

		if ( ! isHydrated ) {
			return [ { importerState: appStates.DISABLED, type, siteTitle } ];
		}

		const status = Object.keys( importers )
			.map( id => importers[ id ] )
			.filter( importer => site.ID === importer.site.ID )
			.filter( importer => type === importer.type );

		if ( 0 === status.length ) {
			return [ { importerState: appStates.INACTIVE, type, siteTitle } ];
		}

		return status.map( item => Object.assign( {}, item, { site, siteTitle } ) );
	}

	updateFromAPI = () => {
		fetchState( this.props.site.ID );
	};

	updateState = () => {
		this.setState( getImporterState() );
	};

	render() {
		const { site, siteSlug, translate } = this.props;
		if ( ! site ) {
			return <Placeholder />;
		}

		const {
			jetpack: isJetpack,
			options: { admin_url: adminUrl },
			slug,
			title: siteTitle,
		} = site;
		const title = siteTitle.length ? siteTitle : slug;
		const description = translate(
			"Import another site's content into " +
				'{{strong}}%(title)s{{/strong}}. Once you start an ' +
				'import, come back here to check on the progress. ' +
				'Check out our {{a}}import guide{{/a}} ' +
				'if you need more help.',
			{
				args: { title },
				components: {
					a: <a href="https://support.wordpress.com/import/" />,
					strong: <strong />,
				},
			}
		);

		const wpImports = this.getImports( WORDPRESS );
		const mediumImports = isEnabled( 'manage/import/medium' ) ? this.getImports( MEDIUM ) : [];
		const bloggerImports = isEnabled( 'manage/import/blogger' ) ? this.getImports( BLOGGER ) : [];

		const siteImporterImports = this.getImports( SITE_IMPORTER );

		const hasWpActiveImports = hasActiveImports( wpImports );
		const hasMediumActiveImports = hasActiveImports( mediumImports );
		const hasBloggerActiveImports = hasActiveImports( bloggerImports );
		const hasSiteImporterActiveImports = hasActiveImports( siteImporterImports );

		return (
			<Main>
				<HeaderCake backHref={ '/settings/general/' + siteSlug }>
					<h1>{ translate( 'Import' ) }</h1>
				</HeaderCake>
				{ isJetpack && (
					<EmptyContent
						illustration="/calypso/images/illustrations/illustration-jetpack.svg"
						title={ translate( 'Want to import into your site?' ) }
						line={ translate( "Visit your site's wp-admin for all your import and export needs." ) }
						action={ translate( 'Import into %(title)s', { args: { title } } ) }
						actionURL={ adminUrl + 'import.php' }
						actionTarget="_blank"
					/>
				) }
				{ ! isJetpack && (
					<EmailVerificationGate>
						<Interval onTick={ this.updateFromAPI } period={ EVERY_FIVE_SECONDS } />
						<CompactCard>
							<header>
								<h1 className="site-settings__importer-section-title importer__section-title">
									{ translate( 'Import Another Site' ) }
								</h1>
								<p className="importer__section-description">{ description }</p>
							</header>
						</CompactCard>

						{ ( ( ! hasMediumActiveImports && ! hasBloggerActiveImports ) || hasWpActiveImports ) &&
							wpImports.map( ( importerStatus, key ) => (
								<WordPressImporter { ...{ key, site, importerStatus } } />
							) ) }

						{ ( ( ! hasWpActiveImports && ! hasBloggerActiveImports ) || hasMediumActiveImports ) &&
							mediumImports.map( ( importerStatus, key ) => (
								<MediumImporter { ...{ key, site, importerStatus } } />
							) ) }

						{ ( ( ! hasWpActiveImports && ! hasMediumActiveImports ) || hasBloggerActiveImports ) &&
							bloggerImports.map( ( importerStatus, key ) => (
								<BloggerImporter { ...{ key, site, importerStatus } } />
							) ) }

						{ isEnabled( 'manage/import/site-importer' ) &&
							siteImporterImports.map( ( importerStatus, key ) => (
								<SiteImporter { ...{ key, site, importerStatus } } />
							) ) }

						{ ! hasWpActiveImports &&
							! hasBloggerActiveImports &&
							! hasMediumActiveImports &&
							! hasSiteImporterActiveImports && (
								<CompactCard
									href={ adminUrl + 'import.php' }
									target="_blank"
									rel="noopener noreferrer"
								>
									{ translate( 'Other importers' ) }
								</CompactCard>
							) }
					</EmailVerificationGate>
				) }
			</Main>
		);
	}
}

export default connect( state => ( {
	site: getSelectedSite( state ),
	siteSlug: getSelectedSiteSlug( state ),
} ) )( localize( SiteSettingsImport ) );
