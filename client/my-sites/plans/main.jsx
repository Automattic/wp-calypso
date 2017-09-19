/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import page from 'page';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import DocumentHead from 'components/data/document-head';
import QueryContactDetailsCache from 'components/data/query-contact-details-cache';
import Main from 'components/main';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import TrackComponentView from 'lib/analytics/track-component-view';
import UpgradesNavigation from 'my-sites/domains/navigation';
import PlansFeaturesMain from 'my-sites/plans-features-main';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import isSiteAutomatedTransferSelector from 'state/selectors/is-site-automated-transfer';
import { isJetpackSite } from 'state/sites/selectors';
import { getSelectedSite, getSelectedSiteId } from 'state/ui/selectors';

const Plans = React.createClass( {
	propTypes: {
		cart: PropTypes.object.isRequired,
		context: PropTypes.object.isRequired,
		intervalType: PropTypes.string,
		selectedSite: PropTypes.object,
		displayJetpackPlans: PropTypes.bool
	},

	getDefaultProps() {
		return {
			intervalType: 'yearly',
			displayJetpackPlans: false
		};
	},

	componentDidMount() {
		this.redirectIfNonJetpackMonthly();

		// Scroll to the top
		if ( typeof window !== 'undefined' ) {
			window.scrollTo( 0, 0 );
		}
	},

	componentDidUpdate() {
		this.redirectIfNonJetpackMonthly();
	},

	redirectIfNonJetpackMonthly() {
		const {
			displayJetpackPlans,
			intervalType,
			selectedSite,
		} = this.props;

		if ( selectedSite && ! displayJetpackPlans && intervalType === 'monthly' ) {
			page.redirect( '/plans/' + selectedSite.slug );
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
			translate,
			displayJetpackPlans
		} = this.props;

		if ( ! selectedSite ) {
			return this.renderPlaceholder();
		}

		return (
			<div>
				<DocumentHead title={ translate( 'Plans', { textOnly: true } ) } />
				<PageViewTracker path="/plans/:site" title="Plans" />
				<QueryContactDetailsCache />
				<TrackComponentView eventName="calypso_plans_view" />
				<Main wideLayout={ true } >
					<SidebarNavigation />

					<div id="plans" className="plans has-sidebar">
						<UpgradesNavigation
							path={ this.props.context.path }
							cart={ this.props.cart }
							selectedSite={ selectedSite } />

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

		const jetpackSite = isJetpackSite( state, selectedSiteId );
		const isSiteAutomatedTransfer = isSiteAutomatedTransferSelector( state, selectedSiteId );

		return {
			selectedSite: getSelectedSite( state ),
			displayJetpackPlans: ! isSiteAutomatedTransfer && jetpackSite
		};
	}
)( localize( Plans ) );
