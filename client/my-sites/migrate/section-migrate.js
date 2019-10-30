/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';

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
import { getSelectedSiteId } from 'state/ui/selectors';

/**
 * Style dependencies
 */
import './section-migrate.scss';

class SectionMigrate extends Component {
	state = {
		sourceSiteId: null,
	};

	jetpackSiteFilter = sourceSite => {
		const { siteId } = this.props;

		return sourceSite.jetpack && sourceSite.ID !== siteId;
	};

	setSourceSiteId = sourceSiteId => {
		this.setState( {
			sourceSiteId,
		} );
	};

	render() {
		const { translate } = this.props;
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
				<CompactCard className="migrate__card">
					<SiteSelector
						className="migrate__source-site"
						selected={ this.state.sourceSiteId }
						onSiteSelect={ this.setSourceSiteId }
						filter={ this.jetpackSiteFilter }
					/>
					<Button primary disabled={ ! this.state.sourceSiteId }>
						{ translate( 'Migrate' ) }
					</Button>
				</CompactCard>
			</Main>
		);
	}
}

export default connect( state => ( {
	siteId: getSelectedSiteId( state ),
} ) )( localize( SectionMigrate ) );
