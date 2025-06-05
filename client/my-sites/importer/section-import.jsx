import { isEnabled } from '@automattic/calypso-config';
import { CompactCard } from '@automattic/components';
import { localize } from 'i18n-calypso';
import { once } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import JetpackPluginUpdateWarning from 'calypso/blocks/jetpack-plugin-update-warning';
import DocumentHead from 'calypso/components/data/document-head';
import EmailVerificationGate from 'calypso/components/email-verification/email-verification-gate';
import EmptyContent from 'calypso/components/empty-content';
import InlineSupportLink from 'calypso/components/inline-support-link';
import Main from 'calypso/components/main';
import NavigationHeader from 'calypso/components/navigation-header';
import SectionHeader from 'calypso/components/section-header';
import { getImporterByKey, getImporters } from 'calypso/lib/importer/importer-config';
import { EVERY_FIVE_SECONDS, Interval } from 'calypso/lib/interval';
import memoizeLast from 'calypso/lib/memoize-last';
import version_compare from 'calypso/lib/version-compare';
import BloggerImporter from 'calypso/my-sites/importer/importer-blogger';
import MediumImporter from 'calypso/my-sites/importer/importer-medium';
import SquarespaceImporter from 'calypso/my-sites/importer/importer-squarespace';
import SubstackImporter from 'calypso/my-sites/importer/importer-substack';
import WixImporter from 'calypso/my-sites/importer/importer-wix';
import WordPressImporter from 'calypso/my-sites/importer/importer-wordpress';
import JetpackImporter from 'calypso/my-sites/importer/jetpack-importer';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { cancelImport, fetchImporterState, startImport } from 'calypso/state/imports/actions';
import { appStates } from 'calypso/state/imports/constants';
import {
	getImporterStatusForSiteId,
	isImporterStatusHydrated,
} from 'calypso/state/imports/selectors';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import { getSiteOption, getSiteTitle } from 'calypso/state/sites/selectors';
import {
	getSelectedSite,
	getSelectedSiteId,
	getSelectedSiteSlug,
} from 'calypso/state/ui/selectors';
import './section-import.scss';

/**
 * Configuration mapping import engines to associated import components.
 * The key is the engine, and the value is the component. To add new importers,
 * add it here and add its configuration to lib/importer/importer-config.
 * @type {Object}
 */
const importerComponents = {
	blogger: BloggerImporter,
	medium: MediumImporter,
	substack: SubstackImporter,
	squarespace: SquarespaceImporter,
	wix: WixImporter,
	wordpress: WordPressImporter,
};

const getImporterTypeForEngine = ( engine ) => `importer-type-${ engine }`;

/**
 * Turns filesize into a range divided by 100MB, so that we dont'need to track specific filesizes in Tracks.
 *
 * For example:
 * 0mb   = 0—100MB (1 chunk)
 * 85mb   = 0—100MB (1 chunk)
 * 100mb  = 100—200MB (2 chunks)
 * 110mb  = 100—200MB (2 chunks)
 * 350mb  = 300—400MB (4 chunks)
 */
const bytesToFilesizeRange = ( bytes ) => {
	const megabytes = parseInt( bytes / ( 1024 * 1024 ) );
	const maxChunk = 100;

	// How many full chunks can fit into our megabytes?
	const chunks = Math.floor( megabytes / maxChunk );

	const min = chunks * 100;
	const max = min + maxChunk;

	// Range of mbs where the filesize fits
	return `${ min }—${ max }MB`;
};

/**
 * The minimum version of the Jetpack plugin required to use the Jetpack Importer API.
 */
const JETPACK_IMPORT_MIN_PLUGIN_VERSION = '12.1';

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
			let eventProps = {};

			// Log more info about upload failures
			if ( importerState === appStates.UPLOAD_FAILURE ) {
				eventProps = {
					error_code: importItem.errorData.code,
					error_type: importItem.errorData.type,
					filesize_range: importItem.file?.size
						? bytesToFilesizeRange( importItem.file.size )
						: null,
				};
			}

			this.trackImporterStateChange( importerState, importerId, eventProps );
		} );
	};

	cancelNonStartedImports = () => {
		this.props.siteImports
			.filter( ( x ) => x.importerState === appStates.READY_FOR_UPLOAD )
			.forEach( ( x ) => this.props.cancelImport( x.site.ID, x.importerId ) );
	};

	trackImporterStateChange = memoizeLast( ( importerState, importerId, eventProps = {} ) => {
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
				...eventProps,
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

	componentWillUnmount() {
		this.cancelNonStartedImports();
	}

	/**
	 * Renders each enabled importer at the provided `state`
	 * @param {string} importerState The state constant for the importer components
	 * @returns {Array} A list of react elements for each enabled importer
	 */
	renderIdleImporters( importerState ) {
		const { site, siteSlug, siteTitle } = this.props;
		const importers = getImporters( {
			isAtomic: site.options?.is_wpcom_atomic,
			isJetpack: site.jetpack,
		} );

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
					siteSlug={ siteSlug }
					siteTitle={ siteTitle }
					importerStatus={ importerStatus }
					isAtomic={ site.options?.is_wpcom_atomic }
					isJetpack={ site.jetpack }
					fromSite={ this.props.fromSite }
				/>
			);
		} );

		// add the 'other importers' card to the end of the list of importers
		return (
			<>
				{ importerElements }
				<CompactCard href={ site.options?.admin_url + 'import.php' }>
					{ this.props.translate( 'Choose from full list' ) }
				</CompactCard>
			</>
		);
	}

	/**
	 * Renders list of importer elements for active import jobs
	 * @returns {Array} Importer react elements for the active import jobs
	 */
	renderActiveImporters() {
		const { fromSite, site, siteSlug, siteTitle, siteImports } = this.props;

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
						siteSlug={ siteSlug }
						siteTitle={ siteTitle }
						importerStatus={ importItem }
					/>
				)
			);
		} );
	}

	/**
	 * Return rendered importer elements
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
		this.props.siteId && this.props.fetchImporterState( this.props.siteId );
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
		const isImportSuccess = this.props.siteImports.some(
			( importItem ) => importItem.importerState === appStates.IMPORT_SUCCESS
		);
		const skipHeader = isSpecificImporter && isImportSuccess;
		return (
			<>
				<Interval onTick={ this.updateFromAPI } period={ EVERY_FIVE_SECONDS } />
				{ ! skipHeader && (
					<SectionHeader label={ sectionHeaderLabel } className="importer__section-header" />
				) }
				{ this.renderImporters() }
			</>
		);
	}

	render() {
		const { site, translate, canImport } = this.props;

		if ( ! canImport ) {
			return (
				<Main>
					<EmptyContent
						title={ this.props.translate( 'You are not authorized to view this page' ) }
					/>
				</Main>
			);
		}

		const {
			jetpack: isJetpack,
			options: { is_wpcom_atomic: isAtomic },
		} = site;

		// Target site Jetpack version is not compatible with the importer.
		const jetpackVersionInCompatible = version_compare(
			this.props.siteJetpackVersion,
			JETPACK_IMPORT_MIN_PLUGIN_VERSION,
			'<'
		);

		const hasUnifiedImporter = isEnabled( 'importer/unified' );

		return (
			<Main>
				<DocumentHead title={ translate( 'Import Content' ) } />
				<NavigationHeader
					screenOptionsTab="import.php"
					navigationItems={ [] }
					title={ translate( 'Import Content' ) }
					subtitle={ translate(
						'Import content from another website or platform. {{learnMoreLink}}Learn more{{/learnMoreLink}}.',
						{
							components: {
								learnMoreLink: <InlineSupportLink supportContext="import" showIcon={ false } />,
							},
						}
					) }
				/>
				<EmailVerificationGate allowUnlaunched>
					{ isJetpack && ! isAtomic && ! hasUnifiedImporter ? (
						<JetpackImporter />
					) : (
						<>
							{ /** Show a plugin update warning if Jetpack version does not support import endpoints */ }
							{ isJetpack && ! isAtomic && (
								<JetpackPluginUpdateWarning
									siteId={ this.props.siteId }
									minJetpackVersion={ JETPACK_IMPORT_MIN_PLUGIN_VERSION }
									warningRequirement={ translate( 'To make sure you can import reliably' ) }
								/>
							) }
							{ isJetpack && ! isAtomic && jetpackVersionInCompatible
								? this.renderIdleImporters( appStates.DISABLED )
								: this.renderImportersList() }
						</>
					) }
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
			siteJetpackVersion: getSiteOption( state, siteId, 'jetpack_version' ),
		};
	},
	{ recordTracksEvent, startImport, fetchImporterState, cancelImport }
)( localize( SectionImport ) );
