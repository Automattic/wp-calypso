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

/**
 * Internal dependencies
 */
import Main from 'components/main';
import QueryConciergeAvailableTimes from 'components/data/query-concierge-available-times';
import QuerySites from 'components/data/query-sites';
import QuerySitePlans from 'components/data/query-site-plans';
import { PLAN_BUSINESS } from 'lib/plans/constants';
import { getConciergeAvailableTimes } from 'state/selectors';
import { WPCOM_CONCIERGE_SCHEDULE_ID } from './constants';
import { getSite } from 'state/sites/selectors';
import Upsell from './shared/upsell';

class ConciergeMain extends Component {
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
		const { availableTimes, site, steps } = this.props;
		const CurrentStep = steps[ this.state.currentStep ];
		const Skeleton = this.props.skeleton;

		if ( ! availableTimes || ! site || ! site.plan ) {
			return <Skeleton />;
		}

		if ( site.plan.product_slug !== PLAN_BUSINESS ) {
			return <Upsell site={ site } />;
		}

		// We have shift data and this is a business site — show the signup steps
		return (
			<CurrentStep
				availableTimes={ availableTimes }
				site={ site }
				onComplete={ this.goToNextStep }
				onBack={ this.goToPreviousStep }
			/>
		);
	};

	render() {
		const { site } = this.props;

		return (
			<Main>
				<QueryConciergeAvailableTimes scheduleId={ WPCOM_CONCIERGE_SCHEDULE_ID } />
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
} ) )( ConciergeMain );
