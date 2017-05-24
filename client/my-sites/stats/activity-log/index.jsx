/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSiteSlug, isJetpackSite } from 'state/sites/selectors';
import StatsFirstView from '../stats-first-view';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import StatsNavigation from '../stats-navigation';

class ActivityLog extends Component {
	componentDidMount() {
		window.scrollTo( 0, 0 );
	}

	render() {
		const { slug, isJetpack } = this.props;

		return (
			<Main wideLayout={ true }>
				<StatsFirstView />
				<SidebarNavigation />
				<StatsNavigation
					isJetpack={ isJetpack }
					slug={ slug }
					section="activity"
				/>
                Hi
			</Main>
		);
	}
}

export default connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );
		const isJetpack = isJetpackSite( state, siteId );
		return {
			isJetpack,
			slug: getSiteSlug( state, siteId )
		};
	}
)( localize( ActivityLog ) );
