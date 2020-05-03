/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { filter, flow, get, isEmpty, memoize, once } from 'lodash';

/**
 * Internal dependencies
 */
import { CompactCard } from '@automattic/components';
import SectionHeader from 'components/section-header';
import DocumentHead from 'components/data/document-head';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import FormattedHeader from 'components/formatted-header';
import ImporterStore, { getState as getImporterState } from 'lib/importer/store';
import { Interval, EVERY_FIVE_SECONDS } from 'lib/interval';
import WordPressImporter from 'my-sites/importer/importer-wordpress';
import MediumImporter from 'my-sites/importer/importer-medium';
import BloggerImporter from 'my-sites/importer/importer-blogger';
import WixImporter from 'my-sites/importer/importer-wix';
import GoDaddyGoCentralImporter from 'my-sites/importer/importer-godaddy-gocentral';
import SquarespaceImporter from 'my-sites/importer/importer-squarespace';
import { fetchState, startImport } from 'lib/importer/actions';
import { getImporters, getImporterByKey } from 'lib/importer/importer-config';
import { appStates } from 'state/imports/constants';

import EmailVerificationGate from 'components/email-verification/email-verification-gate';
import { getSelectedSite, getSelectedSiteSlug, getSelectedSiteId } from 'state/ui/selectors';
import { getSiteTitle } from 'state/sites/selectors';
import { getSelectedImportEngine, getImporterSiteUrl } from 'state/importer-nux/temp-selectors';
import Main from 'components/main';
import JetpackImporter from 'my-sites/importer/jetpack-importer';
import canCurrentUser from 'state/selectors/can-current-user';
import EmptyContent from 'components/empty-content';
import memoizeLast from 'lib/memoize-last';
import { recordTracksEvent } from 'state/analytics/actions';

/**
 * Style dependencies
 */
import './section-import.scss';

/**
 * Configuration mapping import engines to associated import components.
 * The key is the engine, and the value is the component. To add new importers,
 * add it here and add its configuration to lib/importer/importer-config.
 *
 * @type {object}
 */
const importerComponents = {
	blogger: BloggerImporter,
	'godaddy-gocentral': GoDaddyGoCentralImporter,
	medium: MediumImporter,
	squarespace: SquarespaceImporter,
	wix: WixImporter,
	wordpress: WordPressImporter,
};

const filterImportsForSite = ( siteID, imports ) => {
	return filter( imports, ( importItem ) => importItem.site.ID === siteID );
};

const getImporterTypeForEngine = memoize( ( engine ) => `importer-type-${ engine }` );

class SectionImport extends Component {
	static propTypes = {
		site: PropTypes.object,
	};

	state = getImporterState();

	onceAutoStartImport = once( () => {
		const { engine, site } = this.props;
		const { importers: imports } = this.state;

		if ( ! engine ) {
			return;
		}

		if ( ! isEmpty( imports ) ) {
			// Never clobber an existing import
			return;
		}

		if ( ! importerComponents[ engine ] ) {
			return;
		}

		startImport( site.ID, getImporterTypeForEngine( engine ) );
	} );

	handleStateChanges = () => {
		const { site } = this.props;
		const { importers: imports } = this.state;

		filterImportsForSite( site.ID, imports ).map( ( importItem ) => {
			const { importerState, type: importerId } = importItem;
			this.trackImporterStateChange( importerState, importerId );
		} );
	};

	trackImporterStateChange = memoizeLast( ( importerState, importerId ) => {
		const stateToEventNameMap = {
			[ appStates.READY_FOR_UPLOAD ]: 'calypso_importer_view',
			[ appStates.UPLOADING ]: 'calypso_importer_upload_start',
			[ appStates.UPLOAD_SUCCESS ]: 'calypso_importer_upload_success',
			[ appStates.UPLOAD_FAILURE ]: 'calypso_importer_upload_fail',
			[ appStates.MAP_AUTHORS ]: 'calypso_importer_map_authors_view',
			[ appStates.IMPORTING ]: 'calypso_importer_import_start',
			[ appStates.IMPORT_SUCCESS ]: 'calypso_importer_import_success',
			[ appStates.IMPORT_FAILURE ]: 'calypso_importer_import_fail',
		};
		if ( stateToEventNameMap[ importerState ] ) {
			this.props.recordTracksEvent( stateToEventNameMap[ importerState ], {
				importer_id: importerId,
			} );
		}
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
		this.handleStateChanges();
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
		const {
			options: { is_wpcom_atomic: isAtomic },
		} = site;

		const importerElementsAll = getImporters();

		/**
		 * Filter out all importers except the WordPress ones for Atomic sites.
		 */
		const importerElementsFiltered = isAtomic
			? importerElementsAll.filter( ( importer ) => importer.engine === 'wordpress' )
			: importerElementsAll;

		const importerElements = importerElementsFiltered.map( ( importer ) => {
			const { engine } = importer;
			const ImporterComponent = importerComponents[ engine ];

			if ( ! ImporterComponent ) {
				return;
			}

			return (
				<ImporterComponent
					key={ engine }
					site={ site }
					siteTitle={ siteTitle }
					importerStatus={ {
						importerState: state,
						siteTitle,
						type: getImporterTypeForEngine( engine ),
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
				{ this.props.translate( 'Choose from full list' ) }
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
		return importsForSite.map( ( importItem, idx ) => {
			const importer = getImporterByKey( importItem.type );
			if ( ! importer ) {
				return;
			}

			const ImporterComponent = importerComponents[ importer.engine ];

			/**
			 * Ugly hack™
			 *
			 * Sometimes due to the convoluted voodoo sorcery that is the Import Red(fl)ux store
			 * the `site` object that gets passed in `importItem` contains only `{ ID: <site_id> }`.
			 *
			 * This makes the components down the chain fail as they expect to have the full `site` object
			 * with all it's properties.
			 *
			 * That usually happens when you land on an import directly, such as when coming from a
			 * `/?engine=wordpress` URL. In those cases a slew of artifacts occur - the upload reports issues,
			 * the author mapping screen doesn't show any authors to choose from, etc.
			 *
			 * This hack makes sure to overwrite the the `site` object if it's the same as the current site.
			 * Ideally this should always be the case, but if there's an instance where the current site is different
			 * than what's stored in the import data, let it fail as it does now.
			 */
			const importItemId = get( importItem, 'site.ID', null );
			const currentSiteId = get( this.props, 'site.ID', null );

			if ( importItemId && importItemId === currentSiteId ) {
				importItem.site = this.props.site;
			}

			const siteTitle = importItem.siteTitle || this.props.siteTitle;

			return (
				ImporterComponent && (
					<ImporterComponent
						key={ importItem.type + idx }
						site={ importItem.site }
						fromSite={ this.props.fromSite }
						siteTitle={ siteTitle }
						importerStatus={ {
							...importItem,
							siteTitle: siteTitle,
						} }
					/>
				)
			);
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
		const { engine, site, siteTitle } = this.props;

		if ( engine && importerComponents[ engine ] ) {
			return this.renderActiveImporters( filterImportsForSite( site.ID, imports ) );
		}

		if ( ! isHydrated ) {
			return this.renderIdleImporters( site, siteTitle, appStates.DISABLED );
		}

		const importsForSite = filterImportsForSite( site.ID, imports )
			// Add in the 'site' and 'siteTitle' properties to the import objects.
			.map( ( item ) => Object.assign( {}, item, { site, siteTitle } ) );

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

	renderImportersList() {
		const { translate } = this.props;
		const isSpecificImporter = ! isEmpty( this.state.importers );
		const sectionHeaderLabel = isSpecificImporter
			? translate( 'Importing content from:', {
					comment:
						"This text appears above the icon of another service (e.g. Wix, Squarespace) indicating that the process of importing the user's data from that service is ongoing",
			  } )
			: translate( 'I want to import content from:', {
					comment:
						'This text appears above a list of service icons (e.g. Wix, Squarespace) asking the user to choose one.',
			  } );
		return (
			<>
				<Interval onTick={ this.updateFromAPI } period={ EVERY_FIVE_SECONDS } />
				<SectionHeader label={ sectionHeaderLabel } className="importer__section-header" />
				{ this.renderImporters() }
			</>
		);
	}

	render() {
		const { site, translate, canImport } = this.props;

		if ( ! canImport ) {
			return (
				<Main>
					<SidebarNavigation />
					<EmptyContent
						title={ this.props.translate( 'You are not authorized to view this page' ) }
						illustration={ '/calypso/images/illustrations/illustration-404.svg' }
					/>
				</Main>
			);
		}

		const {
			jetpack: isJetpack,
			options: { is_wpcom_atomic: isAtomic },
		} = site;

		return (
			<Main>
				<DocumentHead title={ translate( 'Import Your Content' ) } />
				<SidebarNavigation />
				<FormattedHeader
					className="importer__page-heading"
					headerText={ translate( 'Import Your Content' ) }
					align="left"
				/>
				<EmailVerificationGate allowUnlaunched>
					{ isJetpack && ! isAtomic ? <JetpackImporter /> : this.renderImportersList() }
				</EmailVerificationGate>
			</Main>
		);
	}
}

export default flow(
	connect(
		( state ) => {
			const siteID = getSelectedSiteId( state );
			return {
				engine: getSelectedImportEngine( state ),
				fromSite: getImporterSiteUrl( state ),
				site: getSelectedSite( state ),
				siteSlug: getSelectedSiteSlug( state ),
				siteTitle: getSiteTitle( state, siteID ),
				canImport: canCurrentUser( state, siteID, 'manage_options' ),
			};
		},
		{ recordTracksEvent }
	),
	localize
)( SectionImport );
