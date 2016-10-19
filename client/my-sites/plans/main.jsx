/**
 * External dependencies
 */
import { connect } from 'react-redux';
import i18n from 'i18n-calypso';
import React from 'react';

/**
 * Internal dependencies
 */
import analytics from 'lib/analytics';
import DocumentHead from 'components/data/document-head';
import EmptyContentComponent from 'components/empty-content';
import { getPlansBySiteId } from 'state/sites/plans/selectors';
import { getPlans } from 'state/plans/selectors';
import { getSelectedSite, getSelectedSiteId } from 'state/ui/selectors';
import { isEnabled } from 'config';
import Main from 'components/main';
import MainComponent from 'components/main';
import PlansFeaturesMain from 'my-sites/plans-features-main';
import route from 'lib/route';
import SidebarNavigation from 'my-sites/sidebar-navigation';
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

	shouldDisplayJetpackPlansDisabled() {
		const { selectedSite } = this.props;

		return selectedSite && selectedSite.jetpack && ! isEnabled( 'manage/jetpack-plans' );
	},

	componentDidMount() {
		const { context, selectedSite } = this.props,
			analyticsPageTitle = 'Plans',
			basePath = route.sectionify( context.path ),
			analyticsBasePath = ( selectedSite ) ? basePath + '/:site' : basePath;

		if ( this.shouldDisplayJetpackPlansDisabled() ) {
			analytics.pageView.record( basePath + '/jetpack/:site', analyticsPageTitle + ' > Jetpack Plans Not Available' );
		} else {
			analytics.tracks.recordEvent( 'calypso_plans_view' );
			analytics.pageView.record( analyticsBasePath, analyticsPageTitle );
		}

		// Scroll to the top
		if ( typeof window !== 'undefined' ) {
			window.scrollTo( 0, 0 );
		}
	},

	renderJetpackPlansDisabled() {
		return (
			<MainComponent>
				<EmptyContentComponent
					title={ i18n.translate( 'Plans are not available for Jetpack sites yet.' ) }
					line={ i18n.translate( 'Looking for spam protection?' ) }
					action={ i18n.translate( 'Try Akismet' ) }
					actionURL={ '//akismet.com/plans/?ref=calypso-plans' }
					illustration={ '/calypso/images/drake/drake-nomenus.svg' }
				/>
			</MainComponent>
		);
	},

	render() {
		const { selectedSite, selectedSiteId } = this.props;

		if ( this.shouldDisplayJetpackPlansDisabled() ) {
			this.renderJetpackPlansDisabled();
		}

		return (
			<div>
				<DocumentHead title={ i18n.translate( 'Plans', { textOnly: true } ) } />
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
)( Plans );
