/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import includes from 'lodash/includes';

/**
 * Internal dependencies
 */
import CompactCard from 'components/card/compact';
import EmptyContent from 'components/empty-content';
import GhostImporter from 'my-sites/importer/importer-ghost';
import ImporterStore, { getState as getImporterState } from 'lib/importer/store';
import Interval, { EVERY_FIVE_SECONDS } from 'lib/interval';
import MediumImporter from 'my-sites/importer/importer-medium';
import SquarespaceImporter from 'my-sites/importer/importer-squarespace';
import WordPressImporter from 'my-sites/importer/importer-wordpress';
import { fetchState } from 'lib/importer/actions';
import {
	appStates,
	WORDPRESS, GHOST, MEDIUM, SQUARESPACE
} from 'lib/importer/constants';

export default React.createClass( {
	displayName: 'SiteSettingsImport',

	propTypes: {
		site: PropTypes.shape( {
			slug: PropTypes.string.isRequired,
			title: PropTypes.string.isRequired
		} )
	},

	componentDidMount: function() {
		ImporterStore.on( 'change', this.updateState );
	},

	componentWillUnmount: function() {
		ImporterStore.off( 'change', this.updateState );
	},

	getInitialState: function() {
		return getImporterState();
	},

	/**
	 * Finds the import status objects for a
	 * particular type of importer
	 *
	 * @param {enum} type ImportConstants.IMPORT_TYPE_*
	 * @returns {Array<Object>} ImportStatus objects
	 */
	getImports: function( type ) {
		const { api: { isHydrated }, importers } = this.state;
		const { site } = this.props;
		const { slug, title } = site;
		const siteTitle = title.length ? title : slug;

		const disabledTypes = [ GHOST, SQUARESPACE ];

		if ( ! isHydrated || includes( disabledTypes, type ) ) {
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
	},

	updateFromAPI: function() {
		fetchState( this.props.site.ID );
	},

	updateState: function() {
		this.setState( getImporterState() );
	},

	render: function() {
		const { site } = this.props;
		const { jetpack: isJetpack, options: { admin_url: adminUrl }, slug, title: siteTitle } = site;
		const title = siteTitle.length ? siteTitle : slug;
		const description = this.translate(
			'Import another site\'s content into ' +
			'{{strong}}%(title)s{{/strong}}. Once you start an ' +
			'import, come back here to check on the progress. ' +
			'Check out our {{a}}import guide{{/a}} ' +
			'if you need more help.', {
				args: { title },
				components: {
					a: <a href="https://support.wordpress.com/import/" />,
					strong: <strong />
				}
			}
		);

		if ( isJetpack ) {
			return (
				<EmptyContent
					illustration="/calypso/images/drake/drake-jetpack.svg"
					title={ this.translate( 'Want to import into your site?' ) }
					line={ this.translate( `Visit your site's wp-admin for all your import and export needs.` ) }
					action={ this.translate( 'Import into %(title)s', { args: { title } } ) }
					actionURL={ adminUrl + 'import.php' }
					actionTarget="_blank"
				/>
			);
		}

		return (
			<div className="section-import">
				<Interval onTick={ this.updateFromAPI } period={ EVERY_FIVE_SECONDS } />
				<CompactCard>
					<header>
						<h1 className="importer__section-title">{ this.translate( 'Import Another Site' ) }</h1>
						<p className="importer__section-description">{ description }</p>
					</header>
				</CompactCard>

				{ this.getImports( WORDPRESS ).map( ( importerStatus, key ) =>
					<WordPressImporter { ...{ key, site, importerStatus } } /> ) }

				{ this.getImports( GHOST ).map( ( importerStatus, key ) =>
					<GhostImporter { ...{ key, importerStatus } } /> ) }

				{ this.getImports( MEDIUM ).map( ( importerStatus, key ) =>
					<MediumImporter { ...{ key, site, importerStatus } } /> ) }

				{ this.getImports( SQUARESPACE ).map( ( importerStatus, key ) =>
					<SquarespaceImporter { ...{ key, importerStatus } } /> ) }

				<CompactCard href={ adminUrl + 'import.php' } target="_blank">
						{ this.translate( 'Other importers') }
				</CompactCard>
			</div>
		);
	}
} );
