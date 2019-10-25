/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import CompactCard from 'components/card/compact';
import DocumentHead from 'components/data/document-head';
import FormattedHeader from 'components/formatted-header';
import Main from 'components/main';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import SiteSelector from 'components/site-selector';

/**
 * Style dependencies
 */
import './section-migrate.scss';

class SectionMigrate extends Component {
	jetpackSiteFilter( site ) {
		return site.jetpack;
	}

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
					<SiteSelector filter={ this.jetpackSiteFilter } />
				</CompactCard>
			</Main>
		);
	}
}

export default localize( SectionMigrate );
