/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import config from 'config';

/**
 * Internal dependencies
 */
import CompactCard from 'client/components/card/compact';
import EmptyContent from 'client/components/empty-content';
import ImporterStore, { getState as getImporterState } from 'client/lib/importer/store';
import Interval, { EVERY_FIVE_SECONDS } from 'client/lib/interval';
import WordPressImporter from 'client/my-sites/importer/importer-wordpress';
import MediumImporter from 'client/my-sites/importer/importer-medium';
import { fetchState } from 'client/lib/importer/actions';
import { appStates, WORDPRESS, MEDIUM } from 'client/state/imports/constants';
import EmailVerificationGate from 'client/components/email-verification/email-verification-gate';
import { getSelectedSite, getSelectedSiteSlug } from 'client/state/ui/selectors';
import Main from 'client/components/main';
import HeaderCake from 'client/components/header-cake';
import Placeholder from 'client/my-sites/site-settings/placeholder';

class SiteSettingsImport extends Component {
	static propTypes = {
		site: PropTypes.object,
	};

	state = getImporterState();

	componentDidMount() {
		ImporterStore.on( 'change', this.updateState );
	}

	componentWillUnmount() {
		ImporterStore.off( 'change', this.updateState );
	}

	/**
	 * Finds the import status objects for a
	 * particular type of importer
	 *
	 * @param {enum} type ImportConstants.IMPORT_TYPE_*
	 * @returns {Array<Object>} ImportStatus objects
	 */
	getImports( type ) {
		const { api: { isHydrated }, importers } = this.state;
		const { site } = this.props;
		const { slug, title } = site;
		const siteTitle = title.length ? title : slug;

		if ( ! isHydrated ) {
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
	}

	updateFromAPI = () => {
		fetchState( this.props.site.ID );
	};

	updateState = () => {
		this.setState( getImporterState() );
	};

	render() {
		const { site, siteSlug, translate } = this.props;
		if ( ! site ) {
			return <Placeholder />;
		}

		const { jetpack: isJetpack, options: { admin_url: adminUrl }, slug, title: siteTitle } = site;
		const title = siteTitle.length ? siteTitle : slug;
		const description = translate(
			"Import another site's content into " +
				'{{strong}}%(title)s{{/strong}}. Once you start an ' +
				'import, come back here to check on the progress. ' +
				'Check out our {{a}}import guide{{/a}} ' +
				'if you need more help.',
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

						{ this.getImports( WORDPRESS ).map( ( importerStatus, key ) => (
							<WordPressImporter { ...{ key, site, importerStatus } } />
						) ) }

						{ config.isEnabled( 'manage/import/medium' ) &&
							this.getImports( MEDIUM ).map( ( importerStatus, key ) => (
								<MediumImporter { ...{ key, site, importerStatus } } />
							) ) }

						<CompactCard href={ adminUrl + 'import.php' } target="_blank" rel="noopener noreferrer">
							{ translate( 'Other importers' ) }
						</CompactCard>
					</EmailVerificationGate>
				) }
			</Main>
		);
	}
}

export default connect( state => ( {
	site: getSelectedSite( state ),
	siteSlug: getSelectedSiteSlug( state ),
} ) )( localize( SiteSettingsImport ) );
