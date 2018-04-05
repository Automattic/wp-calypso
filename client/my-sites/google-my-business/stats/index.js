/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import StatsFirstView from 'my-sites/stats/stats-first-view';
import StatsNavigation from 'blocks/stats-navigation';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import EmptyContent from 'components/empty-content';
import { getSelectedSiteSlug, getSelectedSiteId } from 'state/ui/selectors';
import DocumentHead from 'components/data/document-head';

class GoogleMyBusinessStats extends Component {
	static propTypes = {
		translate: PropTypes.func.isRequired,
		siteSlug: PropTypes.string.isRequired,
		siteId: PropTypes.number.isRequired,
	};

	render() {
		const { translate, siteSlug, siteId } = this.props;

		return (
			<Main wideLayout>
				<DocumentHead title={ translate( 'Stats' ) } />
				<StatsFirstView />
				<SidebarNavigation />
				<StatsNavigation selectedItem={ 'googleMyBusiness' } siteId={ siteId } slug={ siteSlug } />
				<EmptyContent title={ translate( 'Google My Business Statistics' ) } />
			</Main>
		);
	}
}

export default connect( state => ( {
	siteSlug: getSelectedSiteSlug( state ),
	siteId: getSelectedSiteId( state ),
} ) )( localize( GoogleMyBusinessStats ) );
