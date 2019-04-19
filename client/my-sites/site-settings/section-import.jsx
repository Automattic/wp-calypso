/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { filter, find, first, flow, includes, get, isEmpty, memoize, once } from 'lodash';

/**
 * Internal dependencies
 */
import CompactCard from 'components/card/compact';
import DocumentHead from 'components/data/document-head';
import ImporterStore, { getState as getImporterState } from 'lib/importer/store';
import Interval, { EVERY_FIVE_SECONDS } from 'lib/interval';
import WordPressImporter from 'my-sites/importer/importer-wordpress';
import MediumImporter from 'my-sites/importer/importer-medium';
import BloggerImporter from 'my-sites/importer/importer-blogger';
import WixImporter from 'my-sites/importer/importer-wix';
import GoDaddyGoCentralImporter from 'my-sites/importer/importer-godaddy-gocentral';
import SquarespaceImporter from 'my-sites/importer/importer-squarespace';
import { fetchState } from 'lib/importer/actions';
import { autoStartSiteImport } from 'state/imports/site-importer/actions';
import {
	appStates,
	WORDPRESS,
	MEDIUM,
	BLOGGER,
	WIX,
	GODADDY_GOCENTRAL,
	SQUARESPACE,
} from 'state/imports/constants';
import EmailVerificationGate from 'components/email-verification/email-verification-gate';
import { getSelectedSite, getSelectedSiteSlug } from 'state/ui/selectors';
import { getSelectedImportEngine, getImporterSiteUrl } from 'state/importer-nux/temp-selectors';
import Main from 'components/main';
import HeaderCake from 'components/header-cake';
import DescriptiveHeader from 'my-sites/site-settings/settings-import/descriptive-header';
import JetpackImporter from 'my-sites/site-settings/settings-import/jetpack-importer';

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
		type: BLOGGER,
		isImporterEnabled: true,
		component: BloggerImporter,
	},
	{
		type: GODADDY_GOCENTRAL,
		isImporterEnabled: true,
		component: GoDaddyGoCentralImporter,
	},
	{
		type: MEDIUM,
		isImporterEnabled: true,
		component: MediumImporter,
	},
	{
		type: SQUARESPACE,
		isImporterEnabled: true,
		component: SquarespaceImporter,
	},
	{
		type: WIX,
		isImporterEnabled: true,
		component: WixImporter,
	},
];

const filterImportsForSite = ( siteID, imports ) => {
	return filter( imports, importItem => siteID && get( importItem, 'site.ID' ) === siteID );
};

const getImporterTypeForEngine = memoize( engine => `importer-type-${ engine }` );
const getImporterForEngine = memoize( engine =>
	find( importers, [ 'type', getImporterTypeForEngine( engine ) ] )
);

class SiteSettingsImport extends Component {
	static propTypes = {
		site: PropTypes.object,
	};

	state = getImporterState();

	onceAutoStartImport = once( () => {
		const { engine, site, fromSite } = this.props;
		const { importers: imports } = this.state;

		if ( ! engine ) {
			return;
		}

		if ( ! isEmpty( imports ) ) {
			// Never clobber an existing import
			return;
		}

		if ( ! getImporterForEngine( engine ) ) {
			return;
		}

		const importerType = getImporterTypeForEngine( engine );

		this.props.autoStartSiteImport( {
			importerStatus: {
				site,
				siteId: site.ID,
				type: importerType,
				importerState: appStates.UPLOAD_SUCCESS,
			},
			params: {
				engine,
				site_url: fromSite,
			},
			site,
			importerType,
			targetSiteUrl: fromSite,
		} );
	} );

	componentDidMount() {
		ImporterStore.on( 'change', this.updateState );
		this.updateFromAPI();
	}

	componentDidUpdate() {
		const { site } = this.props;

		if ( ! site.ID ) {
			return;
		}

		this.onceAutoStartImport();
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
		const { engine, site } = this.props;
		const { slug, title } = site;
		const siteTitle = title.length ? title : slug;

		if ( getImporterForEngine( engine ) ) {
			const activeImports = filterImportsForSite( site.ID, imports );
			const firstImport = first( activeImports );
			const signupImportStarted =
				firstImport &&
				includes(
					[ appStates.IMPORTING, appStates.IMPORT_SUCCESS, appStates.MAP_AUTHORS ],
					firstImport.importerState
				);

			// If there's no active import started, mock one until we actually
			// start importing to avoid showing the UI going through each stage.
			if ( ! signupImportStarted ) {
				return this.renderActiveImporters( [
					{
						importerState: appStates.FROM_SIGNUP,
						type: getImporterTypeForEngine( engine ),
						engine,
						site,
					},
				] );
			}
		}

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

	renderImportersMain() {
		return (
			<>
				<Interval onTick={ this.updateFromAPI } period={ EVERY_FIVE_SECONDS } />
				<DescriptiveHeader />
				{ this.renderImporters() }
			</>
		);
	}

	render() {
		const { site, siteSlug, translate } = this.props;
		const { jetpack: isJetpack } = site;

		return (
			<Main>
				<DocumentHead title={ translate( 'Import' ) } />
				<HeaderCake backHref={ '/settings/general/' + siteSlug }>
					<h1>{ translate( 'Import Content' ) }</h1>
				</HeaderCake>
				<EmailVerificationGate allowUnlaunched>
					{ isJetpack ? <JetpackImporter /> : this.renderImportersMain() }
				</EmailVerificationGate>
			</Main>
		);
	}
}

export default flow(
	connect(
		state => ( {
			engine: getSelectedImportEngine( state ),
			fromSite: getImporterSiteUrl( state ),
			site: getSelectedSite( state ),
			siteSlug: getSelectedSiteSlug( state ),
		} ),
		{ autoStartSiteImport }
	),
	localize
)( SiteSettingsImport );
