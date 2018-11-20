/** @format */

/**
 * This renders the Concierge Chats scheduling page. It is a "wizard" interface with three steps.
 * Each step is a separate component that calls `onComplete` when the step is complete or `onBack`
 * if the user requests to go back. This component uses those callbacks to keep track of the current
 * step and render it.
 *
 * This is still a work in progress and right now it just sets up step navigation. Fetching full data
 * and doing actual work will come later, at which point we'll determine how the step components will
 * gather the data they need.
 */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { some, isEmpty } from 'lodash';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import QueryConciergeInitial from 'components/data/query-concierge-initial';
import QueryUserSettings from 'components/data/query-user-settings';
import QuerySites from 'components/data/query-sites';
import QuerySitePlans from 'components/data/query-site-plans';
import { planMatches } from 'lib/plans';
import { GROUP_WPCOM, TYPE_BUSINESS, TYPE_ECOMMERCE } from 'lib/plans/constants';
import getConciergeAvailableTimes from 'state/selectors/get-concierge-available-times';
import getUserSettings from 'state/selectors/get-user-settings';
import { WPCOM_CONCIERGE_SCHEDULE_ID } from './constants';
import { getSite } from 'state/sites/selectors';
import NoAvailableTimes from './shared/no-available-times';
import Upsell from './shared/upsell';
import PageViewTracker from 'lib/analytics/page-view-tracker';

export class ConciergeMain extends Component {
	constructor( props ) {
		super( props );

		this.state = {
			currentStep: 0,
		};
	}

	goToPreviousStep = () => {
		this.setState( { currentStep: this.state.currentStep - 1 } );
	};

	goToNextStep = () => {
		this.setState( { currentStep: this.state.currentStep + 1 } );
	};

	getDisplayComponent = () => {
		const { appointmentId, availableTimes, site, steps, userSettings } = this.props;

		const CurrentStep = steps[ this.state.currentStep ];
		const Skeleton = this.props.skeleton;

		if ( ! availableTimes || ! site || ! site.plan || ! userSettings ) {
			return <Skeleton />;
		}

		const shouldDisplayUpsell = ! some(
			[ TYPE_BUSINESS, TYPE_ECOMMERCE ].map( type =>
				planMatches( site.plan.product_slug, { type, group: GROUP_WPCOM } )
			)
		);

		if ( shouldDisplayUpsell ) {
			return <Upsell site={ site } />;
		}

		if ( isEmpty( availableTimes ) ) {
			return <NoAvailableTimes />;
		}

		// We have shift data and this is a business site — show the signup steps
		return (
			<CurrentStep
				appointmentId={ appointmentId }
				availableTimes={ availableTimes }
				site={ site }
				onComplete={ this.goToNextStep }
				onBack={ this.goToPreviousStep }
			/>
		);
	};

	render() {
		const { analyticsPath, analyticsTitle, site } = this.props;

		return (
			<Main>
				<PageViewTracker path={ analyticsPath } title={ analyticsTitle } />
				<QueryUserSettings />
				<QueryConciergeInitial scheduleId={ WPCOM_CONCIERGE_SCHEDULE_ID } />
				<QuerySites />
				{ site && <QuerySitePlans siteId={ site.ID } /> }
				{ this.getDisplayComponent() }
			</Main>
		);
	}
}

export default connect( ( state, props ) => ( {
	availableTimes: getConciergeAvailableTimes( state ),
	site: getSite( state, props.siteSlug ),
	userSettings: getUserSettings( state ),
} ) )( ConciergeMain );
