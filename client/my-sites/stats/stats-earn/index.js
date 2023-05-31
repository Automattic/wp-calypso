import { localize } from 'i18n-calypso';
import { flowRight } from 'lodash';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import StatsNavigation from 'calypso/blocks/stats-navigation';
import DocumentHead from 'calypso/components/data/document-head';
import JetpackColophon from 'calypso/components/jetpack-colophon';
import Main from 'calypso/components/main';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import StatsPageHeader from '../stats-page-header';

const StatsEarn = ( props ) => {
	const { siteId, siteSlug, translate } = props;

	// Track the last viewed tab.
	// Necessary to properly configure the fixed navigation headers.
	sessionStorage.setItem( 'jp-stats-last-tab', 'earn' );

	// TODO: should be refactored into separate components
	/* eslint-disable wpcalypso/jsx-classname-namespace */
	return (
		<Main fullWidthLayout>
			<DocumentHead title={ translate( 'Jetpack Stats' ) } />
			<PageViewTracker path="/stats/earn/:site" title="Stats > Earn" />
			<div className="stats">
				<StatsPageHeader page="earn" subHeaderText={ translate( 'Earn stats comes here' ) } />
				<StatsNavigation selectedItem="earn" siteId={ siteId } slug={ siteSlug } />
				<p style={ { padding: '50px', 'text-align': 'center' } }>
					<em>Earn stats</em>
				</p>
				<JetpackColophon />
			</div>
		</Main>
	);
	/* eslint-enable wpcalypso/jsx-classname-namespace */
};

StatsEarn.propTypes = {
	translate: PropTypes.func,
};

const connectComponent = connect( ( state ) => {
	const siteId = getSelectedSiteId( state );
	return {
		siteId,
		siteSlug: getSelectedSiteSlug( state, siteId ),
	};
} );

export default flowRight( connectComponent, localize )( StatsEarn );
