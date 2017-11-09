/** @format */

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
