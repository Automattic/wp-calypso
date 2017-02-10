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
import isSiteAutomatedTransferSelector from 'state/selectors/is-site-automated-transfer';
import { isJetpackSite } from 'state/sites/selectors';

const Plans = React.createClass( {
	propTypes: {
		cart: React.PropTypes.object.isRequired,
		context: React.PropTypes.object.isRequired,
		intervalType: React.PropTypes.string,
		plans: React.PropTypes.array.isRequired,
		selectedSite: React.PropTypes.object,
		selectedSiteId: React.PropTypes.number,
		displayJetpackPlans: React.PropTypes.bool
	},

	getDefaultProps() {
		return {
			intervalType: 'yearly',
			displayJetpackPlans: false
		};
	},

	componentDidMount() {
		// Scroll to the top
		if ( typeof window !== 'undefined' ) {
			window.scrollTo( 0, 0 );
		}
	},

	renderPlaceholder() {
		return (
			<div>
				<DocumentHead title={ this.props.translate( 'Plans', { textOnly: true } ) } />
				<Main wideLayout={ true } >
					<SidebarNavigation />

					<div id="plans" className="plans has-sidebar">
					</div>
				</Main>
			</div>
		);
	},

	render() {
		const {
			selectedSite,
			selectedSiteId,
			translate,
			displayJetpackPlans
		} = this.props;

		if ( this.props.isPlaceholder ) {
			return this.renderPlaceholder();
		}

		return (
			<div>
				<DocumentHead title={ translate( 'Plans', { textOnly: true } ) } />
				<PageViewTracker path="/plans/:site" title="Plans" />
				<TrackComponentView eventName="calypso_plans_view" />
				<Main wideLayout={ true } >
					<SidebarNavigation />

					<div id="plans" className="plans has-sidebar">
						<UpgradesNavigation
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
							displayJetpackPlans={ displayJetpackPlans }
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
		const isPlaceholder = ! selectedSiteId;

		const jetpackSite = isJetpackSite( state, selectedSiteId );
		const isSiteAutomatedTransfer = isSiteAutomatedTransferSelector( state, selectedSiteId );

		return {
			isPlaceholder,
			plans: getPlans( state ),
			selectedSite: getSelectedSite( state ),
			selectedSiteId: selectedSiteId,
			displayJetpackPlans: ! isSiteAutomatedTransfer && jetpackSite
		};
	}
)( localize( Plans ) );
