/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { once } from 'lodash';

/**
 * Internal dependencies
 */
import { CompactCard } from '@automattic/components';
import SectionHeader from 'calypso/components/section-header';
import DocumentHead from 'calypso/components/data/document-head';
import SidebarNavigation from 'calypso/my-sites/sidebar-navigation';
import FormattedHeader from 'calypso/components/formatted-header';
import { Interval, EVERY_FIVE_SECONDS } from 'calypso/lib/interval';
import WordPressImporter from 'calypso/my-sites/importer/importer-wordpress';
import MediumImporter from 'calypso/my-sites/importer/importer-medium';
import BloggerImporter from 'calypso/my-sites/importer/importer-blogger';
import WixImporter from 'calypso/my-sites/importer/importer-wix';
import GoDaddyGoCentralImporter from 'calypso/my-sites/importer/importer-godaddy-gocentral';
import SquarespaceImporter from 'calypso/my-sites/importer/importer-squarespace';
import { fetchState, startImport } from 'calypso/state/imports/actions';
import { getImporters, getImporterByKey } from 'calypso/lib/importer/importer-config';
import { appStates } from 'calypso/state/imports/constants';
import {
	getImporterStatusForSiteId,
	isImporterStatusHydrated,
} from 'calypso/state/imports/selectors';

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

const getImporterTypeForEngine = ( engine ) => `importer-type-${ engine }`;

class SectionImport extends Component {
	static propTypes = {
		site: PropTypes.object,
		engine: PropTypes.string,
		fromSite: PropTypes.string,
	};

	onceAutoStartImport = once( () => {
		const { engine, siteId, siteImports, afterStartImport } = this.props;

		if ( ! engine ) {
			return;
		}

		// If there is no existing import and the `engine` is valid, start a new import.
		if ( siteImports.length === 0 && importerComponents[ engine ] ) {
			this.props.startImport( siteId, getImporterTypeForEngine( engine ) );
		}

		// After import was started, redirect back to the route without `engine` query arg.
		// That removes the `engine` prop from this component and doesn't spoil future
		// rendering when the import is, e.g., cancelled.
		//
		// We redirect back even if we decided to not start the import requested by the `engine`
		// query arg. The request has been processed, only with a negative result.
		afterStartImport?.();
	} );

	handleStateChanges = () => {
		this.props.siteImports.map( ( importItem ) => {
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
		this.updateFromAPI();
		if ( this.props.isImporterStatusHydrated ) {
			this.onceAutoStartImport();
		}
	}

	componentDidUpdate() {
		if ( this.props.isImporterStatusHydrated ) {
			this.onceAutoStartImport();
		}

		this.handleStateChanges();
	}

	/**
	 * Renders each enabled importer at the provided `state`
	 *
	 * @param {string} importerState The state constant for the importer components
	 * @returns {Array} A list of react elements for each enabled importer
	 */
	renderIdleImporters( importerState ) {
		const { site, siteTitle } = this.props;
		let importers = getImporters();

		// Filter out all importers except the WordPress ones for Atomic sites.
		if ( site.options.is_wpcom_atomic ) {
			importers = importers.filter( ( importer ) => importer.engine === 'wordpress' );
		}

		const importerElements = importers.map( ( { engine } ) => {
			const ImporterComponent = importerComponents[ engine ];

			if ( ! ImporterComponent ) {
				return null;
			}

			const importerStatus = {
				importerState,
				type: getImporterTypeForEngine( engine ),
			};

			return (
				<ImporterComponent
					key={ engine }
					site={ site }
					siteTitle={ siteTitle }
					importerStatus={ importerStatus }
				/>
			);
		} );

		// add the 'other importers' card to the end of the list of importers
		return (
			<>
				{ importerElements }
				<CompactCard
					href={ site.options.admin_url + 'import.php' }
					target="_blank"
					rel="noopener noreferrer"
				>
					{ this.props.translate( 'Choose from full list' ) }
				</CompactCard>
			</>
		);
	}

	/**
	 * Renders list of importer elements for active import jobs
	 *
	 * @returns {Array} Importer react elements for the active import jobs
	 */
	renderActiveImporters() {
		const { fromSite, site, siteTitle, siteImports } = this.props;

		return siteImports.map( ( importItem, idx ) => {
			const importer = getImporterByKey( importItem.type );
			if ( ! importer ) {
				return;
			}

			const ImporterComponent = importerComponents[ importer.engine ];

			return (
				ImporterComponent && (
					<ImporterComponent
						key={ idx }
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
		const { engine } = this.props;

		// If starting a new import was requested by the `engine` query param, never show the list
		// of available "idle" importers. Always render the list of active importers, even if it's
		// initially empty. A new import will be started very soon by `onceAutoStartImport`.
		if ( engine && importerComponents[ engine ] ) {
			return this.renderActiveImporters();
		}

		if ( ! this.props.isImporterStatusHydrated ) {
			return this.renderIdleImporters( appStates.DISABLED );
		}

		if ( this.props.siteImports.length === 0 ) {
			return this.renderIdleImporters( appStates.INACTIVE );
		}

		return this.renderActiveImporters();
	}

	updateFromAPI = () => {
		this.props.siteId && this.props.fetchState( this.props.siteId );
	};

	renderImportersList() {
		const { translate } = this.props;
		const isSpecificImporter = this.props.siteImports.length > 0;
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
		const siteId = getSelectedSiteId( state );
		return {
			siteId,
			site: getSelectedSite( state ),
			siteSlug: getSelectedSiteSlug( state ),
			siteTitle: getSiteTitle( state, siteId ),
			siteImports: getImporterStatusForSiteId( state, siteId ),
			canImport: canCurrentUser( state, siteId, 'manage_options' ),
			isImporterStatusHydrated: isImporterStatusHydrated( state ),
		};
	},
	{ recordTracksEvent, startImport, fetchState }
)( localize( SectionImport ) );
