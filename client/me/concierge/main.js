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
import CalendarStep from './calendar-step';
import ConfirmationStep from './confirmation-step';
import InfoStep from './info-step';
import Main from 'components/main';
import Skeleton from './skeleton';
import QueryConciergeShifts from 'components/data/query-concierge-shifts';
import { getConciergeShifts } from 'state/selectors';

const STEP_COMPONENTS = [ InfoStep, CalendarStep, ConfirmationStep ];

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

	render() {
		const CurrentStep = STEP_COMPONENTS[ this.state.currentStep ];
		const { shifts } = this.props;

		// TODO:
		// 1. pass in the real scheduleId for WP.com concierge schedule.
		// 2. render the shifts for real.
		return (
			<Main>
				<QueryConciergeShifts scheduleId={ 123 } />
				{ shifts ? (
					<CurrentStep
						shifts={ shifts }
						onComplete={ this.goToNextStep }
						onBack={ this.goToPreviousStep }
					/>
				) : (
					<Skeleton />
				) }
			</Main>
		);
	}
}

export default connect(
	state => ( {
		shifts: getConciergeShifts( state ),
	} ),
	{ getConciergeShifts }
)( ConciergeMain );
