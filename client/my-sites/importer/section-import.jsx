/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { filter, flow, get, isEmpty, once } from 'lodash';

/**
 * Internal dependencies
 */
import CompactCard from 'components/card/compact';
import DocumentHead from 'components/data/document-head';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import ImporterStore, { getState as getImporterState } from 'lib/importer/store';
import Interval, { EVERY_FIVE_SECONDS } from 'lib/interval';
import WordPressImporter from 'my-sites/importer/importer-wordpress';
import MediumImporter from 'my-sites/importer/importer-medium';
import BloggerImporter from 'my-sites/importer/importer-blogger';
import WixImporter from 'my-sites/importer/importer-wix';
import GoDaddyGoCentralImporter from 'my-sites/importer/importer-godaddy-gocentral';
import SquarespaceImporter from 'my-sites/importer/importer-squarespace';
import { fetchState, startImport } from 'lib/importer/actions';
import { getImporters } from 'lib/importer/importer-config';
import { appStates } from 'state/imports/constants';
import EmailVerificationGate from 'components/email-verification/email-verification-gate';
import { getSelectedSite, getSelectedSiteSlug, getSelectedSiteId } from 'state/ui/selectors';
import { getSelectedImportEngine, getImporterSiteUrl } from 'state/importer-nux/temp-selectors';
import Main from 'components/main';
import FormattedHeader from 'components/formatted-header';
import JetpackImporter from 'my-sites/importer/jetpack-importer';
import ExternalLink from 'components/external-link';
import canCurrentUser from 'state/selectors/can-current-user';
import EmptyContent from 'components/empty-content';

/**
 * Style dependencies
 */
import './section-import.scss';

/**
 * Configuration mapping import engines to associated import components.
 * The key is the engine, and the value is the component. To add new importers,
 * add it here and add its configuration to lib/importer/importer-config.
 *
 * @type {Object}
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
	return filter( imports, importItem => importItem.site.ID === siteID );
};

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

		startImport( site.ID, engine );
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
		const importerElements = getImporters().map( importer => {
			const { engine } = importer;
			const ImporterComponent = importerComponents[ engine ];

			if ( ! ImporterComponent ) {
				return;
			}

			return (
				<ImporterComponent
					key={ engine }
					site={ site }
					importerStatus={ {
						engine,
						importerState: state,
						siteTitle,
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
		return importsForSite.map( ( importItem, idx ) => {
			const ImporterComponent = importerComponents[ importItem.engine ];

			if ( ! ImporterComponent ) {
				return;
			}

			return (
				<ImporterComponent
					key={ importItem.engine + idx }
					site={ importItem.site }
					fromSite={ this.props.fromSite }
					importerStatus={ importItem }
				/>
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
		const { engine, site } = this.props;
		const { slug, title } = site;
		const siteTitle = title.length ? title : slug;

		if ( engine && importerComponents[ engine ] ) {
			return this.renderActiveImporters( filterImportsForSite( site.ID, imports ) );
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

	renderImportersList() {
		return (
			<>
				<Interval onTick={ this.updateFromAPI } period={ EVERY_FIVE_SECONDS } />
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

		const { jetpack: isJetpack } = site;
		const headerText = translate( 'Import your content' );
		const subHeaderText = translate(
			'Bring content hosted elsewhere over to WordPress.com. ' +
				'{{a}}Find out what we currently support.{{/a}}',
			{
				components: {
					a: <ExternalLink href="https://en.support.wordpress.com/import/" />,
				},
			}
		);

		return (
			<Main>
				<DocumentHead title={ translate( 'Import' ) } />
				<SidebarNavigation />
				<FormattedHeader
					className="importer__section-header"
					headerText={ headerText }
					subHeaderText={ subHeaderText }
				/>
				<EmailVerificationGate allowUnlaunched>
					{ isJetpack ? <JetpackImporter /> : this.renderImportersList() }
				</EmailVerificationGate>
			</Main>
		);
	}
}

export default flow(
	connect( state => ( {
		engine: getSelectedImportEngine( state ),
		fromSite: getImporterSiteUrl( state ),
		site: getSelectedSite( state ),
		siteSlug: getSelectedSiteSlug( state ),
		canImport: canCurrentUser( state, getSelectedSiteId( state ), 'manage_options' ),
	} ) ),
	localize
)( SectionImport );
