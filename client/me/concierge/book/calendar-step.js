/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import HeaderCake from 'components/header-cake';
import { getConciergeSignupForm } from 'state/selectors';
import { getCurrentUserId, getCurrentUserLocale } from 'state/current-user/selectors';
import { bookConciergeAppointment } from 'state/concierge/actions';
import AvailableTimePicker from '../shared/available-time-picker';
import {
	CONCIERGE_STATUS_BOOKING,
	CONCIERGE_STATUS_BOOKED,
	WPCOM_CONCIERGE_SCHEDULE_ID,
} from '../constants';
import analytics from 'lib/analytics';

class CalendarStep extends Component {
	static propTypes = {
		availableTimes: PropTypes.array.isRequired,
		currentUserId: PropTypes.number.isRequired,
		currentUserLocale: PropTypes.string.isRequired,
		onBack: PropTypes.func.isRequired,
		onComplete: PropTypes.func.isRequired,
		site: PropTypes.object.isRequired,
		signupForm: PropTypes.object.isRequired,
	};

	onSubmit = timestamp => {
		const { currentUserId, signupForm, site } = this.props;
		const meta = {
			message: signupForm.message,
			timezone: signupForm.timezone,
		};

		this.props.bookConciergeAppointment(
			WPCOM_CONCIERGE_SCHEDULE_ID,
			timestamp,
			currentUserId,
			site.ID,
			meta
		);
	};

	componentDidMount() {
		analytics.tracks.recordEvent( 'calypso_concierge_book_calendar_step' );
	}

	componentWillUpdate( nextProps ) {
		if ( nextProps.signupForm.status === CONCIERGE_STATUS_BOOKED ) {
			// go to confirmation page if booking was successfull
			this.props.onComplete();
		}
	}

	render() {
		const { availableTimes, currentUserLocale, onBack, signupForm, site, translate } = this.props;

		return (
			<div>
				<HeaderCake onClick={ onBack }>{ translate( 'Choose Concierge Session' ) }</HeaderCake>
				<AvailableTimePicker
					actionText={ translate( 'Book this session' ) }
					availableTimes={ availableTimes }
					currentUserLocale={ currentUserLocale }
					disabled={ signupForm.status === CONCIERGE_STATUS_BOOKING }
					description={ translate( 'Please select a day to have your Concierge session.' ) }
					onSubmit={ this.onSubmit }
					site={ site }
					signupForm={ signupForm }
				/>
			</div>
		);
	}
}

export default connect(
	state => ( {
		signupForm: getConciergeSignupForm( state ),
		currentUserId: getCurrentUserId( state ),
		currentUserLocale: getCurrentUserLocale( state ),
	} ),
	{ bookConciergeAppointment }
)( localize( CalendarStep ) );
