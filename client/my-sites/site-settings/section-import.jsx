/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { isEnabled } from 'config';
import { filter, find, first, flow, get, isEmpty, memoize, once } from 'lodash';

/**
 * Internal dependencies
 */
import CompactCard from 'components/card/compact';
import ImporterStore, { getState as getImporterState } from 'lib/importer/store';
import Interval, { EVERY_FIVE_SECONDS } from 'lib/interval';
import WordPressImporter from 'my-sites/importer/importer-wordpress';
import MediumImporter from 'my-sites/importer/importer-medium';
import BloggerImporter from 'my-sites/importer/importer-blogger';
import SiteImporter from 'my-sites/importer/importer-site-importer';
import Importer6 from 'my-sites/importer/importer-6';
import SquarespaceImporter from 'my-sites/importer/importer-squarespace';
import { fetchState, autoStartImport } from 'lib/importer/actions';
import {
	appStates,
	WORDPRESS,
	MEDIUM,
	BLOGGER,
	SITE_IMPORTER,
	IMPORTER_6,
	SQUARESPACE,
} from 'state/imports/constants';
import EmailVerificationGate from 'components/email-verification/email-verification-gate';
import { getSelectedSite, getSelectedSiteSlug } from 'state/ui/selectors';
import { getSelectedImportEngine, getImporterSiteUrl } from 'state/importer-nux/temp-selectors';
import Main from 'components/main';
import HeaderCake from 'components/header-cake';
import Placeholder from 'my-sites/site-settings/placeholder';
import DescriptiveHeader from 'my-sites/site-settings/settings-import/descriptive-header';
import JetpackImporter from 'my-sites/site-settings/settings-import/jetpack-importer';

import EmptyContent from 'components/empty-content';

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
		isImporterEnabled: true,
		component: SiteImporter,
	},
	{
		type: SQUARESPACE,
		isImporterEnabled: true,
		component: SquarespaceImporter,
	},
	{
		type: IMPORTER_6,
		isImporterEnabled: isEnabled( 'manage/import/engine6' ),
		component: Importer6,
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

		autoStartImport( site.ID, getImporterTypeForEngine( engine ), fromSite );
	} );

	componentDidMount() {
		ImporterStore.on( 'change', this.updateState );
		this.updateFromAPI();
	}

	componentDidUpdate() {
		const { site } = this.props;

		if ( ! ( site && site.ID ) ) {
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

		// console.log( 'zzzzzzz', engine, imports, getImporterForEngine( engine ) );

		if ( getImporterForEngine( engine ) ) {
			const activeImports = filterImportsForSite( site.ID, imports );
			const firstImport = first( activeImports );

			console.log( { firstImport } )

			if ( isEmpty( activeImports ) || get( firstImport, 'importerState' ) === 'importer-upload-success' ) {
				return (
					<EmptyContent
						illustration="/calypso/images/illustrations/illustration-ok.svg"
						title={ 'Congratulations!' }
						line={ 'Your password has been reset.' }
					/>
				)
			}

			// console.log( activeImports.length )

			return this.renderActiveImporters( activeImports );
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
		const { translate } = this.props;
		// console.log( this.state.importers );

		if ( this.props.engine && false ) {

		// if (this.state.autoStartInProgress && false ) {
			// return <h2>autoStartInProgress</h2>
			return (
				<EmptyContent
					illustration="/calypso/images/illustrations/illustration-ok.svg"
					title={ translate( 'Congratulations!' ) }
					line={ translate( 'Your password has been reset.' ) }
				/>
			);
		}

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
		if ( ! site ) {
			return <Placeholder />;
		}

		const { jetpack: isJetpack } = site;

		// console.log( { state: this.state } );

		return (
			<Main>
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
	connect( state => ( {
		engine: getSelectedImportEngine( state ),
		fromSite: getImporterSiteUrl( state ),
		site: getSelectedSite( state ),
		siteSlug: getSelectedSiteSlug( state ),
	} ) ),
	localize
)( SiteSettingsImport );
