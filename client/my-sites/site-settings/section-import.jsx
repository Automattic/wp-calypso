/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { isEnabled } from 'config';
import { filter, find, flow, get, includes, keyBy, keys, pickBy } from 'lodash';
import { parse } from 'qs';

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
import { fetchState } from 'lib/importer/actions';
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
import Main from 'components/main';
import HeaderCake from 'components/header-cake';
import Placeholder from 'my-sites/site-settings/placeholder';
import { getImporterOption } from 'state/ui/importers/selectors';
import { selectImporterOption } from 'state/ui/importers/actions';

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

const importersDataObject = keyBy( importers, 'type' );
const enabledImportersData = pickBy( importersDataObject, 'isImporterEnabled' );
const enabledImporterTypes = keys( enabledImportersData );

const filterImportsForSite = ( siteID, imports ) => {
	return filter( imports, importItem => importItem.site.ID === siteID );
};

const getSiteTitle = site => site.title || site.slug || '';

class SiteSettingsImport extends Component {
	static propTypes = {
		site: PropTypes.object,
	};

	state = getImporterState();

	componentDidMount() {
		const { engine: engineParam } = parse( window.location.search.replace( '?', '' ) );

		ImporterStore.on( 'change', this.updateState );

		this.updateFromAPI();

		// If the engine param is valid and enabled, set it in redux.
		includes( enabledImporterTypes, engineParam ) && this.props.selectImporterOption( engineParam );
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
	renderIdleImporters() {
		const {
			api: { isHydrated },
		} = this.state;
		const { site } = this.props;
		const siteTitle = getSiteTitle( site );

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
						importerState: isHydrated ? appStates.INACTIVE : appStates.DISABLED,
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
	 * Receives import jobs data (`activeImporter`) and returns an
	 * importer view for that importer
	 *
	 * @param {Object} activeImporter
	 * @returns {Component||null} Importer Component for the active import job
	 */
	renderImporterScreen( activeImporter ) {
		const { importerOption, site } = this.props;
		const selectedImportType = get( activeImporter, 'type' ) || importerOption;
		const ImporterComponent = get( importersDataObject, [ selectedImportType, 'component' ] );

		if ( ! ImporterComponent ) {
			// TODO: We should cover cases where the engine does not
			// have a corresponding component. It seems unlikely to happen though.
			return null;
		}

		const siteTitle = getSiteTitle( site );

		// TODO: activeImporter is initially a locally generated instance that later
		// gets replaced with a proper importer instance.
		// We hope to eliminate the need for this and will need to make changes here
		// when that time comes
		return (
			<ImporterComponent
				site={ site }
				importerStatus={ {
					// activeImporter can be undefined... Is this an issue?
					...activeImporter,
					site,
					siteTitle,
				} }
			/>
		);
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
		const { importerOption } = this.props;

		if ( ! isHydrated && ! importerOption ) {
			return this.renderIdleImporters();
		}

		const activeImporter = flow(
			// Pick only imports for the current site
			items => filterImportsForSite( get( this, 'props.site.ID' ), items ),
			// Find the first enabled import
			items => find( items, item => includes( enabledImporterTypes, item.type ) )
		)( imports );

		return activeImporter || importerOption
			? this.renderImporterScreen( activeImporter )
			: this.renderIdleImporters();
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
	connect(
		state => ( {
			site: getSelectedSite( state ),
			siteSlug: getSelectedSiteSlug( state ),
			importerOption: getImporterOption( state ),
		} ),
		{ selectImporterOption }
	),
	localize
)( SiteSettingsImport );
