/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { defer, filter, get, isEmpty, once } from 'lodash';

/**
 * Internal dependencies
 */
import { CompactCard } from '@automattic/components';
import SectionHeader from 'calypso/components/section-header';
import DocumentHead from 'calypso/components/data/document-head';
import SidebarNavigation from 'calypso/my-sites/sidebar-navigation';
import FormattedHeader from 'calypso/components/formatted-header';
import ImporterStore, { getState as getImporterState } from 'calypso/lib/importer/store';
import { Interval, EVERY_FIVE_SECONDS } from 'calypso/lib/interval';
import WordPressImporter from 'calypso/my-sites/importer/importer-wordpress';
import MediumImporter from 'calypso/my-sites/importer/importer-medium';
import BloggerImporter from 'calypso/my-sites/importer/importer-blogger';
import WixImporter from 'calypso/my-sites/importer/importer-wix';
import GoDaddyGoCentralImporter from 'calypso/my-sites/importer/importer-godaddy-gocentral';
import SquarespaceImporter from 'calypso/my-sites/importer/importer-squarespace';
import { fetchState, startImport } from 'calypso/lib/importer/actions';
import { getImporters, getImporterByKey } from 'calypso/lib/importer/importer-config';
import { appStates } from 'calypso/state/imports/constants';

import EmailVerificationGate from 'calypso/components/email-verification/email-verification-gate';
import {
	getSelectedSite,
	getSelectedSiteSlug,
	getSelectedSiteId,
} from 'calypso/state/ui/selectors';
import { getSiteTitle } from 'calypso/state/sites/selectors';
import Main from 'calypso/components/main';
import JetpackImporter from 'calypso/my-sites/importer/jetpack-importer';
import canCurrentUser from 'calypso/state/selectors/can-current-user';
import EmptyContent from 'calypso/components/empty-content';
import memoizeLast from 'calypso/lib/memoize-last';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

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

const getImporterTypeForEngine = ( engine ) => `importer-type-${ engine }`;

class SectionImport extends Component {
	static propTypes = {
		site: PropTypes.object,
		engine: PropTypes.string,
		fromSite: PropTypes.string,
	};

	state = getImporterState();

	onceAutoStartImport = once( () => {
		const { engine, site, afterStartImport } = this.props;
		const { importers } = this.state;

		if ( ! engine ) {
			return;
		}

		// If there is no existing import and the `engine` is valid, start a new import.
		if ( isEmpty( importers ) && importerComponents[ engine ] ) {
			defer( () => {
				startImport( site.ID, getImporterTypeForEngine( engine ) );
				// After import was started, redirect back to the route without `engine` query arg.
				// That removes the `engine` prop from this component and doesn't spoil future
				// rendering when the import is, e.g., cancelled.
				afterStartImport?.();
			} );
		} else {
			// We decided to not start the import despite being requested by the `engine` query arg.
			// Redirect back to route without the request.
			afterStartImport?.();
		}
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
		const { fromSite, site, siteTitle } = this.props;

		return importsForSite.map( ( importItem ) => {
			const importer = getImporterByKey( importItem.type );
			if ( ! importer ) {
				return;
			}

			const ImporterComponent = importerComponents[ importer.engine ];

			return (
				ImporterComponent && (
					<ImporterComponent
						key={ importItem.importerId }
						site={ site }
						fromSite={ fromSite }
						siteTitle={ siteTitle }
						importerStatus={ importItem }
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
			importers,
		} = this.state;
		const { engine, site, siteTitle } = this.props;

		const importsForSite = filterImportsForSite( site.ID, importers );

		// If starting a new import was requested by the `engine` query param, never show the list
		// of available "idle" importers. Always render the list of active importers, even if it's
		// initially empty. A new import will be started very soon by `onceAutoStartImport`.
		if ( engine && importerComponents[ engine ] ) {
			return this.renderActiveImporters( importsForSite );
		}

		if ( ! isHydrated ) {
			return this.renderIdleImporters( site, siteTitle, appStates.DISABLED );
		}

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
				<DocumentHead title={ translate( 'Import Content' ) } />
				<SidebarNavigation />
				<FormattedHeader
					brandFont
					className="importer__page-heading"
					headerText={ translate( 'Import Content' ) }
					align="left"
				/>
				<EmailVerificationGate allowUnlaunched>
					{ isJetpack && ! isAtomic ? <JetpackImporter /> : this.renderImportersList() }
				</EmailVerificationGate>
			</Main>
		);
	}
}

export default connect(
	( state ) => {
		const siteID = getSelectedSiteId( state );
		return {
			site: getSelectedSite( state ),
			siteSlug: getSelectedSiteSlug( state ),
			siteTitle: getSiteTitle( state, siteID ),
			canImport: canCurrentUser( state, siteID, 'manage_options' ),
		};
	},
	{ recordTracksEvent }
)( localize( SectionImport ) );
