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
import CompactCard from 'components/card/compact';
import DocumentHead from 'components/data/document-head';
import FormattedHeader from 'components/formatted-header';
import Main from 'components/main';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import SiteSelector from 'components/site-selector';
import { Interval, EVERY_MINUTE } from 'lib/interval';
import { getSite } from 'state/sites/selectors';
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
		sourceSiteId: null,
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

	selectSourceSite = () => {
		if ( ! this.state.sourceSiteId ) {
			return;
		}

		page( `/migrate/${ this.state.sourceSiteId }/${ this.props.targetSiteSlug }` );
	};

	setSourceSiteId = sourceSiteId => {
		this.setState( {
			sourceSiteId,
		} );
	};

	startMigration = () => {
		const { sourceSiteId, targetSiteId } = this.props;

		if ( ! sourceSiteId || ! targetSiteId ) {
			return;
		}

		this.setState( { migrationStatus: 'restoring' } );
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

	renderMigrationRestoring() {
		const { targetSite } = this.props;
		const targetSiteDomain = get( targetSite, 'domain' );

		return (
			<CompactCard>
				<div className="migrate__status">Restoring backup to { targetSiteDomain }.</div>
			</CompactCard>
		);
	}

	renderSourceSiteSelector() {
		return (
			<CompactCard className="migrate__card">
				<SiteSelector
					className="migrate__source-site"
					selected={ this.state.sourceSiteId }
					onSiteSelect={ this.setSourceSiteId }
					filter={ this.jetpackSiteFilter }
				/>
				<Button primary onClick={ this.selectSourceSite } disabled={ ! this.state.sourceSiteId }>
					Continue
				</Button>
			</CompactCard>
		);
	}

	render() {
		const { sourceSiteId } = this.props;
		const headerText = 'Migrate';
		const subHeaderText = 'Migrate your WordPress site to WordPress.com';

		let migrationElement;

		switch ( this.state.migrationStatus ) {
			case 'inactive':
				migrationElement = sourceSiteId
					? this.renderMigrationConfirmation()
					: this.renderSourceSiteSelector();
				break;

			case 'restoring':
				migrationElement = this.renderMigrationRestoring();
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
				<FormattedHeader
					className="migrate__section-header"
					headerText={ headerText }
					subHeaderText={ subHeaderText }
					align="left"
				/>
				{ migrationElement }
			</Main>
		);
	}
}

export default connect( ( state, ownProps ) => ( {
	sourceSite: ownProps.sourceSiteId && getSite( state, ownProps.sourceSiteId ),
	targetSite: getSelectedSite( state ),
	targetSiteId: getSelectedSiteId( state ),
	targetSiteSlug: getSelectedSiteSlug( state ),
} ) )( localize( SectionMigrate ) );
