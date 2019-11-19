/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import page from 'page';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import CardHeading from 'components/card-heading';
import CompactCard from 'components/card/compact';
import DocumentHead from 'components/data/document-head';
import FormattedHeader from 'components/formatted-header';
import Main from 'components/main';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import SiteSelector from 'components/site-selector';
import { Interval, EVERY_MINUTE } from 'lib/interval';
import { getSite, getSiteAdminUrl, isJetpackSite } from 'state/sites/selectors';
import { getSelectedSite, getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import wpLib from 'lib/wp';

/**
 * Style dependencies
 */
import './section-migrate.scss';

const wpcom = wpLib.undocumented();

class SectionMigrate extends Component {
	state = {
		migrationStatus: 'unknown',
	};

	componentDidMount() {
		this.updateFromAPI();
	}

	jetpackSiteFilter = sourceSite => {
		const { targetSiteId } = this.props;

		return sourceSite.jetpack && sourceSite.ID !== targetSiteId;
	};

	resetMigration = () => {
		const { targetSiteId, targetSiteSlug } = this.props;

		wpcom.resetMigration( targetSiteId ).then( () => {
			page( `/migrate/${ targetSiteSlug }` );
			this.updateFromAPI();
		} );
	};

	setSourceSiteId = sourceSiteId => {
		page( `/migrate/${ sourceSiteId }/${ this.props.targetSiteSlug }` );
	};

	startMigration = () => {
		const { sourceSiteId, targetSiteId } = this.props;

		if ( ! sourceSiteId || ! targetSiteId ) {
			return;
		}

		this.setState( { migrationStatus: 'backing-up' } );
		wpcom.startMigration( sourceSiteId, targetSiteId ).then( () => this.updateFromAPI() );
	};

	updateFromAPI = () => {
		const { targetSiteId } = this.props;
		wpcom
			.getMigrationStatus( targetSiteId )
			.then( response => {
				const { status: migrationStatus } = response;
				if ( migrationStatus ) {
					this.setState( { migrationStatus } );
				}
			} )
			.catch( () => {
				// @TODO: handle status error
			} );
	};

	renderLoading() {
		return (
			<CompactCard>
				<span className="migrate__placeholder">Loading...</span>
			</CompactCard>
		);
	}

	renderMigrationComplete() {
		const { targetSite } = this.props;
		const viewSiteURL = get( targetSite, 'URL' );

		return (
			<CompactCard>
				<div className="migrate__status">Your migration has completed successfully.</div>
				<Button primary href={ viewSiteURL }>
					View site
				</Button>
				<Button onClick={ this.resetMigration }>Start over</Button>
			</CompactCard>
		);
	}

	renderMigrationConfirmation() {
		const { sourceSite, targetSite } = this.props;

		const sourceSiteDomain = get( sourceSite, 'domain' );
		const targetSiteDomain = get( targetSite, 'domain' );

		return (
			<CompactCard>
				<div className="migrate__confirmation">
					Do you want to migrate all content from { sourceSiteDomain } to { targetSiteDomain }? All
					existing content on { targetSiteDomain } will be lost.
				</div>
				<Button primary onClick={ this.startMigration }>
					Start Migration
				</Button>
			</CompactCard>
		);
	}

	renderMigrationError() {
		return (
			<CompactCard>
				<div className="migrate__status">There was an error with your migration.</div>
				<Button primary onClick={ this.resetMigration }>
					Try again
				</Button>
			</CompactCard>
		);
	}

	renderMigrationProgress() {
		const { targetSite } = this.props;
		const targetSiteDomain = get( targetSite, 'domain' );

		return (
			<CompactCard>
				<div className="migrate__status">
					{ this.state.migrationStatus } backup to { targetSiteDomain }.
				</div>
			</CompactCard>
		);
	}

	renderSourceSiteSelector() {
		const { isTargetSiteJetpack, targetSiteImportAdminUrl, targetSiteSlug } = this.props;
		const importHref = isTargetSiteJetpack
			? targetSiteImportAdminUrl
			: `/import/${ targetSiteSlug }`;

		return (
			<>
				<FormattedHeader
					className="migrate__section-header"
					headerText="Migrate your WordPress site to WordPress.com"
					align="left"
				/>
				<CompactCard className="migrate__card">
					<CardHeading>Select the Jetpack enabled site you want to migrate.</CardHeading>
					<div className="migrate__explain">
						If your site is connected to your WordPress.com account through Jetpack, we can migrate
						all your content, users, themes, plugins, and settings.
					</div>
					<SiteSelector
						className="migrate__source-site"
						onSiteSelect={ this.setSourceSiteId }
						filter={ this.jetpackSiteFilter }
					/>
					<div className="migrate__import-instead">
						Don't see it? You can still <a href={ importHref }>import just your content</a>.
					</div>
				</CompactCard>
				<CompactCard className="migrate__card-footer">
					A Business Plan is required to migrate your theme and plugins. Or you can{ ' ' }
					<a href={ importHref }>import just your content</a> instead.
				</CompactCard>
			</>
		);
	}

	render() {
		const { sourceSiteId } = this.props;

		let migrationElement;

		switch ( this.state.migrationStatus ) {
			case 'inactive':
				migrationElement = sourceSiteId
					? this.renderMigrationConfirmation()
					: this.renderSourceSiteSelector();
				break;

			case 'backing-up':
			case 'restoring':
				migrationElement = this.renderMigrationProgress();
				break;

			case 'done':
				migrationElement = this.renderMigrationComplete();
				break;

			case 'error':
				migrationElement = this.renderMigrationError();
				break;

			case 'unknown':
			default:
				migrationElement = this.renderLoading();
		}

		return (
			<Main>
				<Interval onTick={ this.updateFromAPI } period={ EVERY_MINUTE } />
				<DocumentHead title="Migrate" />
				<SidebarNavigation />
				{ migrationElement }
			</Main>
		);
	}
}

export default connect( ( state, ownProps ) => {
	const targetSiteId = getSelectedSiteId( state );
	return {
		isTargetSiteJetpack: !! isJetpackSite( state, targetSiteId ),
		sourceSite: ownProps.sourceSiteId && getSite( state, ownProps.sourceSiteId ),
		targetSite: getSelectedSite( state ),
		targetSiteId,
		targetSiteImportAdminUrl: getSiteAdminUrl( state, targetSiteId, 'import.php' ),
		targetSiteSlug: getSelectedSiteSlug( state ),
	};
} )( localize( SectionMigrate ) );
