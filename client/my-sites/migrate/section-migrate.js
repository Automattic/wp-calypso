/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import page from 'page';
import { get } from 'lodash';
import wpLib from 'lib/wp';

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
import { getSelectedSite, getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import { getSite } from 'state/sites/selectors';

/**
 * Style dependencies
 */
import './section-migrate.scss';

const wpcom = wpLib.undocumented();

class SectionMigrate extends Component {
	state = {
		sourceSiteId: null,
	};

	jetpackSiteFilter = sourceSite => {
		const { targetSiteId } = this.props;

		return sourceSite.jetpack && sourceSite.ID !== targetSiteId;
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

		wpcom.startMigration( sourceSiteId, targetSiteId );
	};

	renderMigrationConfirmation() {
		const { sourceSite, targetSite, translate } = this.props;

		const sourceSiteDomain = get( sourceSite, 'domain' );
		const targetSiteDomain = get( targetSite, 'domain' );

		return (
			<CompactCard>
				<div className="migrate__confirmation">
					{ translate(
						'Do you want to migrate all content from %(sourceSite)s to %(targetSite)s? All existing content on %(sourceSite)s will be lost.',
						{ args: { sourceSite: sourceSiteDomain, targetSite: targetSiteDomain } }
					) }
				</div>
				<Button primary onClick={ this.startMigration }>
					{ translate( 'Start Migration' ) }
				</Button>
			</CompactCard>
		);
	}

	renderSourceSiteSelector() {
		const { translate } = this.props;

		return (
			<CompactCard className="migrate__card">
				<SiteSelector
					className="migrate__source-site"
					selected={ this.state.sourceSiteId }
					onSiteSelect={ this.setSourceSiteId }
					filter={ this.jetpackSiteFilter }
				/>
				<Button primary onClick={ this.selectSourceSite } disabled={ ! this.state.sourceSiteId }>
					{ translate( 'Continue' ) }
				</Button>
			</CompactCard>
		);
	}

	render() {
		const { sourceSiteId, translate } = this.props;
		const headerText = translate( 'Migrate' );
		const subHeaderText = translate( 'Migrate your WordPress site to WordPress.com' );

		return (
			<Main>
				<DocumentHead title={ translate( 'Migrate' ) } />
				<SidebarNavigation />
				<FormattedHeader
					className="migrate__section-header"
					headerText={ headerText }
					subHeaderText={ subHeaderText }
				/>
				{ sourceSiteId ? this.renderMigrationConfirmation() : this.renderSourceSiteSelector() }
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
