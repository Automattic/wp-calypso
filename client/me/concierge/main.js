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
import { isEmpty } from 'lodash';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import QueryConciergeInitial from 'components/data/query-concierge-initial';
import QueryUserSettings from 'components/data/query-user-settings';
import QuerySites from 'components/data/query-sites';
import QuerySitePlans from 'components/data/query-site-plans';
import getConciergeAvailableTimes from 'state/selectors/get-concierge-available-times';
import getConciergeScheduleId from 'state/selectors/get-concierge-schedule-id';
import getConciergeNextAppointment from 'state/selectors/get-concierge-next-appointment';
import getUserSettings from 'state/selectors/get-user-settings';
import { getSite } from 'state/sites/selectors';
import NoAvailableTimes from './shared/no-available-times';
import Upsell from './shared/upsell';
import AppointmentInfo from './shared/appointment-info';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import ReauthRequired from 'me/reauth-required';
import twoStepAuthorization from 'lib/two-step-authorization';

export class ConciergeMain extends Component {
	constructor( props ) {
		super( props );

		this.state = {
			currentStep: 0,
			reauthRequired: false,
		};
	}

	componentDidMount() {
		twoStepAuthorization.on( 'change', this.checkReauthRequired );
		this.checkReauthRequired();
	}

	componentWillUnmount() {
		twoStepAuthorization.off( 'change', this.checkReauthRequired );
	}

	checkReauthRequired = () => {
		const reauthRequired = twoStepAuthorization.isReauthRequired();
		if ( this.state.reauthRequired !== reauthRequired ) {
			this.setState( { reauthRequired } );
		}
	};

	goToPreviousStep = () => {
		this.setState( { currentStep: this.state.currentStep - 1 } );
	};

	goToNextStep = () => {
		this.setState( { currentStep: this.state.currentStep + 1 } );
	};

	getDisplayComponent = () => {
		const {
			appointmentId,
			availableTimes,
			site,
			steps,
			scheduleId,
			userSettings,
			nextAppointment,
			rescheduling,
		} = this.props;

		const CurrentStep = steps[ this.state.currentStep ];
		const Skeleton = this.props.skeleton;

		if ( ! availableTimes || ! site || ! site.plan || null == scheduleId || ! userSettings ) {
			return <Skeleton />;
		}

		// if scheduleId is 0, it means the user is not eligible for the concierge service.
		if ( scheduleId === 0 ) {
			return <Upsell site={ site } />;
		}

		if ( nextAppointment && ! rescheduling ) {
			return <AppointmentInfo appointment={ nextAppointment } site={ site } />;
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
		const { reauthRequired } = this.state;
		const siteId = site && site.ID;
		return (
			<Main>
				<PageViewTracker path={ analyticsPath } title={ analyticsTitle } />
				<ReauthRequired twoStepAuthorization={ twoStepAuthorization } />
				{ ! reauthRequired && (
					<>
						<QueryUserSettings />
						<QuerySites />
						{ siteId && <QueryConciergeInitial siteId={ siteId } /> }
						{ siteId && <QuerySitePlans siteId={ siteId } /> }
					</>
				) }
				{ this.getDisplayComponent() }
			</Main>
		);
	}
}

export default connect( ( state, props ) => ( {
	availableTimes: getConciergeAvailableTimes( state ),
	nextAppointment: getConciergeNextAppointment( state ),
	site: getSite( state, props.siteSlug ),
	scheduleId: getConciergeScheduleId( state ),
	userSettings: getUserSettings( state ),
} ) )( ConciergeMain );
