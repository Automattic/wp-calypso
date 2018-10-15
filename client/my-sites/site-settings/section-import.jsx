/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { isEnabled } from 'config';
import { filter, flow, get, isEmpty } from 'lodash';

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
import SquarespaceImporter from 'my-sites/importer/importer-squarespace';
import { fetchState, startImport } from 'lib/importer/actions';
import {
	appStates,
	WORDPRESS,
	MEDIUM,
	BLOGGER,
	SITE_IMPORTER,
	SQUARESPACE,
} from 'state/imports/constants';
import EmailVerificationGate from 'components/email-verification/email-verification-gate';
import { getSelectedSite, getSelectedSiteSlug } from 'state/ui/selectors';
import { getSelectedImportEngine, getImporterSiteUrl } from 'state/importer-nux/temp-selectors';
import Main from 'components/main';
import HeaderCake from 'components/header-cake';
import Placeholder from 'my-sites/site-settings/placeholder';

/**
 * Configuration for each of the importers to be rendered in this section. If
 * you're adding a new importer, add it here. Importers will be rendered in the
 * order they are listed in this array.
 *
 * @type {Array}
 */
const importers = [
	{
		type: WORDPRESS,
		isImporterEnabled: true,
		component: WordPressImporter,
	},
	{
		type: MEDIUM,
		isImporterEnabled: isEnabled( 'manage/import/medium' ),
		component: MediumImporter,
	},
	{
		type: BLOGGER,
		isImporterEnabled: true,
		component: BloggerImporter,
	},
	{
		type: SITE_IMPORTER,
		isImporterEnabled: isEnabled( 'manage/import/site-importer' ),
		component: SiteImporter,
	},
	{
		type: SQUARESPACE,
		isImporterEnabled: true,
		component: SquarespaceImporter,
	},
];

const filterImportsForSite = ( siteID, imports ) => {
	return filter( imports, importItem => importItem.site.ID === siteID );
};

class SiteSettingsImport extends Component {
	static propTypes = {
		site: PropTypes.object,
	};

	state = getImporterState();

	componentDidMount() {
		ImporterStore.on( 'change', this.updateState );
		this.updateFromAPI();
	}

	componentDidUpdate() {
		const { engine, site } = this.props;
		const { importers: imports } = this.state;

		if ( isEmpty( imports ) && 'wix' === engine && site && site.ID ) {
			this.props.startImport( site.ID, 'importer-type-site-importer' );
		}
	}

	componentWillUnmount() {
		ImporterStore.off( 'change', this.updateState );
	}

	/**
	 * Renders each enabled importer at the provided `state`
	 *
	 * @param {object} site Data for the currently active site
	 * @param {string} siteTitle The site's title
	 * @param {string} state The state constant for the importer components
	 * @returns {Array} A list of react elements for each enabled importer
	 */
	renderIdleImporters( site, siteTitle, state ) {
		const importerElements = importers.map( importer => {
			const { type, isImporterEnabled, component: ImporterComponent } = importer;

			if ( ! isImporterEnabled ) {
				return;
			}

			return (
				<ImporterComponent
					key={ type }
					site={ site }
					importerStatus={ {
						importerState: state,
						siteTitle,
						type,
					} }
				/>
			);
		} );

		// add the 'other importers' card to the end of the list of importers
		const {
			options: { admin_url: adminUrl },
		} = site;

		const otherImportersCard = (
			<CompactCard
				key="other-importers-card"
				href={ adminUrl + 'import.php' }
				target="_blank"
				rel="noopener noreferrer"
			>
				{ this.props.translate( 'Other importers' ) }
			</CompactCard>
		);

		return [ ...importerElements, otherImportersCard ];
	}

	/**
	 * Receives import jobs data (`importsForSite`) and maps this to return a
	 * list of importer elements for active import jobs
	 *
	 * @param {Array} importsForSite The list of active import jobs
	 * @returns {Array} Importer react elements for the active import jobs
	 */
	renderActiveImporters( importsForSite ) {
		return importers.map( importer => {
			const { type, isImporterEnabled, component: ImporterComponent } = importer;

			if ( ! isImporterEnabled ) {
				return;
			}

			return importsForSite
				.filter( importItem => importItem.type === type )
				.map( ( importItem, idx ) => (
					<ImporterComponent
						key={ type + idx }
						site={ importItem.site }
						fromSite={ this.props.fromSite }
						importerStatus={ importItem }
					/>
				) );
		} );
	}

	/**
	 * Return rendered importer elements
	 *
	 * @returns {Array} Importer react elements
	 */
	renderImporters() {
		const {
			api: { isHydrated },
			importers: imports,
		} = this.state;
		const { site } = this.props;
		const { slug, title } = site;
		const siteTitle = title.length ? title : slug;

		if ( ! isHydrated ) {
			return this.renderIdleImporters( site, siteTitle, appStates.DISABLED );
		}

		const importsForSite = filterImportsForSite( site.ID, imports )
			// Add in the 'site' and 'siteTitle' properties to the import objects.
			.map( item => Object.assign( {}, item, { site, siteTitle } ) );

		if ( 0 === importsForSite.length ) {
			return this.renderIdleImporters( site, siteTitle, appStates.INACTIVE );
		}

		return this.renderActiveImporters( importsForSite );
	}

	updateFromAPI = () => {
		const siteID = get( this, 'props.site.ID' );
		siteID && fetchState( siteID );
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
			'Import content from another site into ' +
				'{{strong}}%(title)s{{/strong}}. Learn more about ' +
				'the import process in our {{a}}support documentation{{/a}}. ' +
				'Once you start importing, you can visit ' +
				'this page to check on the progress.',
			{
				args: { title },
				components: {
					a: <a href="https://support.wordpress.com/import/" />,
					strong: <strong />,
				},
			}
		);

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
						{ this.renderImporters() }
					</EmailVerificationGate>
				) }
			</Main>
		);
	}
}

export default flow(
	localize,
	connect(
		state => ( {
			engine: getSelectedImportEngine( state ),
			fromSite: getImporterSiteUrl( state ),
			site: getSelectedSite( state ),
			siteSlug: getSelectedSiteSlug( state ),
		} ),
		{
			startImport,
		}
	)
)( SiteSettingsImport );
