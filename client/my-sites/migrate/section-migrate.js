/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';

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

/**
 * Style dependencies
 */
import './section-migrate.scss';

class SectionMigrate extends Component {
	state = {
		sourceSite: null,
	};

	setSourceSite = site => {
		this.setState( {
			sourceSite: site,
		} );
	};

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
					<SiteSelector
						className="migrate__source-site"
						selected={ this.state.sourceSite }
						onSiteSelect={ this.setSourceSite }
						filter={ this.jetpackSiteFilter }
					/>
					<Button primary disabled={ ! this.state.sourceSite }>
						{ translate( 'Migrate' ) }
					</Button>
				</CompactCard>
			</Main>
		);
	}
}

export default localize( SectionMigrate );
