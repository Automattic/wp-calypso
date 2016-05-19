/**
 * External dependencies
 */
import React, { PropTypes, Component } from 'react';
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import InputChrono from 'components/input-chrono';
import DatePicker from 'components/date-picker';
import User from 'lib/user';

/**
 * Local dependencies
 */
import Clock from './clock';
import Header from './header';
import utils from './utils';

var user = new User(),
	noop = () => {};

class PostSchedule extends Component {
	constructor( props ) {
		super( props );

		// bounds
		this.updateDate = this.updateDate.bind( this );
		this.setViewDate = this.setViewDate.bind( this );
		this.setCurrentMonth = this.setCurrentMonth.bind( this );

		this.state = {
			calendarViewDate: i18n.moment(
				this.props.selectedDay
					? this.props.selectedDay
					: new Date()
			)
		};
	}

	componentWillMount() {
		if ( ! this.props.selectedDay ) {
			return this.setState( { localizedDate: null } );
		}

		this.setState( {
			localizedDate: this.getDateToUserLocation( this.props.selectedDay )
		} );
	}

	componentWillReceiveProps( nextProps ) {
		if ( this.props.selectedDay === nextProps.selectedDay ) {
			return;
		}

		if ( ! nextProps.selectedDay ) {
			return this.setState( { localizedDate: null } );
		}

		this.setState( {
			localizedDate: this.getDateToUserLocation( nextProps.selectedDay )
		} );
	}

	locale() {
		return {
			formatMonthTitle: function() {
				return;
			}
		};
	}

	events() {
		return this.props.events.concat(
			this.getEventsFromPosts( this.props.posts )
		);
	}

	getEventsFromPosts( postsList = [] ) {
		return postsList.map( post => {
			let localDate = this.getDateToUserLocation( post.date );

			return {
				id: post.ID,
				title: post.title,
				date: localDate.toDate()
			};
		} );
	}

	getDateToUserLocation( date ) {
		return utils.convertDateToUserLocation(
			date || new Date(),
			this.props.timezone,
			this.props.gmtOffset
		);
	}

	setCurrentMonth( date ) {
		date = i18n.moment( date );
		this.props.onMonthChange( date );
		this.setState( { calendarViewDate: date } );
	}

	setViewDate( date ) {
		this.setState( { calendarViewDate: i18n.moment( date ) } );
	}

	getCurrentDate() {
		return i18n.moment( this.state.localizedDate || this.getDateToUserLocation() );
	}

	updateDate( date ) {
		this.setState( { calendarViewDate: date } );

		this.props.onDateChange( utils.convertDateToGivenOffset(
			date,
			this.props.timezone,
			this.props.gmtOffset
		) );
	}

	/** Renders **/

	renderInputChrono() {
		var lang = user.getLanguage(),
			date = this.getCurrentDate(),
			chronoText;

		if ( this.state.localizedDate ) {
			let today = i18n.moment().startOf( 'day' ),
				selected = i18n.moment( date ).startOf( 'day' ),
				diffInMinutes = selected.diff( today, 'days' );

			if ( -7 <= diffInMinutes && diffInMinutes <= 6 ) {
				chronoText = date.calendar();
			} else {
				chronoText = date.format( 'L LT' );
			}
		}

		return (
			<div className="chrono__container">
				<InputChrono
					value={ chronoText }
					placeholder={ date.calendar() }
					lang={ lang ? lang.langSlug : null }
					onSet={ this.updateDate }
				/>

				<hr className="post-schedule__hr" />
			</div>
		);
	}

	renderClock() {
		let date = this.state.localizedDate;

		if ( ! date ) {
			date = this.getDateToUserLocation( new Date() );
		}

		return (
			<Clock
				date={ date }
				timezone={ this.props.timezone }
				gmtOffset={ this.props.gmtOffset }
				onChange={ this.updateDate }
			/>
		);
	}

	render() {
		return (
			<div className="post-schedule" >
				<Header
					date={ this.state.calendarViewDate }
					onDateChange={ this.setViewDate }
				/>

				{ this.renderInputChrono() }

				<DatePicker
					events={ this.events() }
					locale={ this.locale() }
					selectedDay={
						this.state.localizedDate
							? this.state.localizedDate.toDate()
							: null
					}
					timeReference={ this.getCurrentDate() }
					calendarViewDate={ this.state.calendarViewDate.toDate() }

					onMonthChange={ this.setCurrentMonth }
					onSelectDay={ this.updateDate }
				/>

				{ this.renderClock() }
			</div>
		);
	}
}

/**
 * Statics
 */
PostSchedule.displayName = 'PostSchedule';

PostSchedule.propTypes = {
	events: PropTypes.array,
	posts: PropTypes.array,
	timezone: PropTypes.string,
	gmtOffset: PropTypes.number,

	onDateChange: PropTypes.func,
	onMonthChange: PropTypes.func
};

PostSchedule.defaultProps = {
	posts: [],
	events: [],
	onDateChange: noop,
	onMonthChange: noop
};

export default PostSchedule;
