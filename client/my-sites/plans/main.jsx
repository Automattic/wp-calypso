/**
 * External dependencies
 */
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import React from 'react';

/**
 * Internal dependencies
 */
import DocumentHead from 'components/data/document-head';
import { getPlansBySiteId } from 'state/sites/plans/selectors';
import { getPlans } from 'state/plans/selectors';
import { getSelectedSite, getSelectedSiteId } from 'state/ui/selectors';
import Main from 'components/main';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import PlansFeaturesMain from 'my-sites/plans-features-main';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import TrackComponentView from 'lib/analytics/track-component-view';
import UpgradesNavigation from 'my-sites/upgrades/navigation';
import QueryPlans from 'components/data/query-plans';
import QuerySitePlans from 'components/data/query-site-plans';

const Plans = React.createClass( {
	propTypes: {
		cart: React.PropTypes.object.isRequired,
		context: React.PropTypes.object.isRequired,
		intervalType: React.PropTypes.string,
		plans: React.PropTypes.array.isRequired,
		selectedSite: React.PropTypes.object.isRequired,
		selectedSiteId: React.PropTypes.number.isRequired,
		sitePlans: React.PropTypes.object.isRequired
	},

	getDefaultProps() {
		return {
			intervalType: 'yearly'
		};
	},

	componentDidMount() {
		// Scroll to the top
		if ( typeof window !== 'undefined' ) {
			window.scrollTo( 0, 0 );
		}
	},

	render() {
		const { selectedSite, selectedSiteId, translate } = this.props;

		return (
			<div>
				<DocumentHead title={ translate( 'Plans', { textOnly: true } ) } />
				<PageViewTracker path="/plans/:site" title="Plans" />
				<TrackComponentView eventName="calypso_plans_view" />
				<Main wideLayout={ true } >
					<SidebarNavigation />

					<div id="plans" className="plans has-sidebar">
						<UpgradesNavigation
							sitePlans={ this.props.sitePlans }
							path={ this.props.context.path }
							cart={ this.props.cart }
							selectedSite={ selectedSite } />

						<QueryPlans />
						<QuerySitePlans siteId={ selectedSiteId } />

						<PlansFeaturesMain
							site={ selectedSite }
							intervalType={ this.props.intervalType }
							hideFreePlan={ true }
							selectedFeature={ this.props.selectedFeature }
						/>
					</div>
				</Main>
			</div>
		);
	}
} );

export default connect(
	( state ) => {
		const selectedSiteId = getSelectedSiteId( state );
		return {
			plans: getPlans( state ),
			sitePlans: getPlansBySiteId( state, selectedSiteId ),
			selectedSite: getSelectedSite( state ),
			selectedSiteId: selectedSiteId
		};
	}
)( localize( Plans ) );
