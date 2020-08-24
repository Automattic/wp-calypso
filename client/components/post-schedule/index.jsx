/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import moment from 'moment';
import classNames from 'classnames';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import InputChrono from 'components/input-chrono';
import DatePicker from 'components/date-picker';
import QuerySiteSettings from 'components/data/query-site-settings';
import EventsTooltip from 'components/date-picker/events-tooltip';
import { getCurrentUserLocale } from 'state/current-user/selectors';

/**
 * Local dependencies
 */
import Clock from './clock';
import Header from './header';
import { convertDateToUserLocation, convertDateToGivenOffset } from './utils';

/**
 * Style dependencies
 */
import './style.scss';

const noop = () => {};

class PostSchedule extends Component {
	static propTypes = {
		events: PropTypes.array,
		posts: PropTypes.array,
		timezone: PropTypes.string,
		gmtOffset: PropTypes.number,
		site: PropTypes.object,
		displayInputChrono: PropTypes.bool,
		onDateChange: PropTypes.func,
		onMonthChange: PropTypes.func,
		onDayMouseEnter: PropTypes.func,
		onDayMouseLeave: PropTypes.func,
		userLocale: PropTypes.string,
	};

	static defaultProps = {
		posts: [],
		events: [],
		displayInputChrono: true,
		onDateChange: noop,
		onMonthChange: noop,
		onDayMouseEnter: noop,
		onDayMouseLeave: noop,
	};

	state = {
		calendarViewDate: moment( this.props.selectedDay ? this.props.selectedDay : new Date() ),
		tooltipContext: null,
		showTooltip: false,
	};

	UNSAFE_componentWillMount() {
		if ( ! this.props.selectedDay ) {
			return this.setState( {
				localizedDate: null,
				isFutureDate: false,
			} );
		}

		const localizedDate = this.getDateToUserLocation( this.props.selectedDay );
		this.setState( {
			localizedDate,
			isFutureDate: localizedDate.isAfter(),
		} );
	}

	UNSAFE_componentWillReceiveProps( nextProps ) {
		if ( this.props.selectedDay === nextProps.selectedDay ) {
			return;
		}

		if ( ! nextProps.selectedDay ) {
			return this.setState( { localizedDate: null } );
		}

		this.setState( {
			localizedDate: this.getDateToUserLocation( nextProps.selectedDay ),
		} );
	}

	getLocaleUtils() {
		return {
			formatMonthTitle: function () {
				return;
			},
		};
	}

	events() {
		return this.props.events.concat( this.getEventsFromPosts( this.props.posts ) );
	}

	getEventsFromPosts( postsList = [] ) {
		return postsList.map( ( post ) => {
			const localDate = this.getDateToUserLocation( post.date );

			return {
				id: post.ID,
				title: post.title,
				date: localDate.toDate(),
			};
		} );
	}

	getDateToUserLocation( date ) {
		return convertDateToUserLocation(
			date || new Date(),
			this.props.timezone,
			this.props.gmtOffset
		);
	}

	setCurrentMonth = ( date ) => {
		date = moment( date );
		this.props.onMonthChange( date );
		this.setState( { calendarViewDate: date } );
	};

	setViewDate = ( date ) => {
		this.setState( { calendarViewDate: moment( date ) } );
	};

	getCurrentDate() {
		return moment( this.state.localizedDate || this.getDateToUserLocation() );
	}

	updateDate = ( date ) => {
		const convertedDate = convertDateToGivenOffset(
			date,
			this.props.timezone,
			this.props.gmtOffset
		);

		this.setState( {
			calendarViewDate: date,
			isFutureDate: convertedDate.isAfter(),
		} );

		this.props.onDateChange( convertedDate );
	};

	handleOnDayMouseEnter = ( date, modifiers, event, eventsByDay ) => {
		const postEvents = this.getEventsFromPosts( this.props.posts );

		if ( ! postEvents || ! postEvents.length ) {
			return this.props.onDayMouseEnter( date, modifiers, event, eventsByDay );
		}

		this.setState( {
			eventsByDay,
			tooltipContext: event.target,
			showTooltip: true,
		} );
	};

	handleOnDayMouseLeave = ( date, modifiers, event, eventsByDay ) => {
		const postEvents = this.getEventsFromPosts( this.props.posts );

		if ( ! postEvents || ! postEvents.length ) {
			return this.props.onDayMouseLeave( date, modifiers, event, eventsByDay );
		}

		this.setState( {
			eventsByDay: [],
			tooltipContext: null,
			showTooltip: false,
		} );
	};

	renderInputChrono() {
		const date = this.getCurrentDate();
		let chronoText;

		if ( this.state.localizedDate ) {
			const today = moment().startOf( 'day' );
			const selected = moment( date ).startOf( 'day' );
			const diffInMinutes = selected.diff( today, 'days' );

			if ( -7 <= diffInMinutes && diffInMinutes <= 6 ) {
				chronoText = date.calendar();
			} else {
				chronoText = date.format( 'L LT' );
			}
		}

		return (
			<div className="post-schedule__input-chrono">
				<InputChrono
					value={ chronoText }
					placeholder={ date.calendar() }
					lang={ this.props.userLocale }
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
				siteId={ this.props.site ? this.props.site.ID : null }
				siteSlug={ this.props.site ? this.props.site.slug : null }
				onChange={ this.updateDate }
			/>
		);
	}

	render() {
		const handleEventsTooltip = ! this.props.events || ! this.props.events.length;

		const className = classNames( 'post-schedule', {
			'is-future-date': this.state.isFutureDate,
		} );

		return (
			<div className={ className }>
				{
					// Used by Clock for now, likely others in the future.
					this.props.site && <QuerySiteSettings siteId={ this.props.site.ID } />
				}
				<Header
					date={ this.state.calendarViewDate }
					onDateChange={ this.setViewDate }
					inputChronoDisplayed={ this.props.displayInputChrono }
				/>

				{ this.props.displayInputChrono && this.renderInputChrono() }

				<DatePicker
					events={ this.events() }
					localeUtils={ this.getLocaleUtils() }
					disabledDays={ this.props.disabledDays }
					showOutsideDays={ this.props.showOutsideDays }
					modifiers={ this.props.modifiers }
					selectedDay={ this.state.localizedDate ? this.state.localizedDate.toDate() : null }
					timeReference={ this.getCurrentDate() }
					calendarViewDate={ this.state.calendarViewDate.toDate() }
					onMonthChange={ this.setCurrentMonth }
					onSelectDay={ this.updateDate }
					onDayMouseEnter={ this.handleOnDayMouseEnter }
					onDayMouseLeave={ this.handleOnDayMouseLeave }
				/>

				{ this.renderClock() }

				{ handleEventsTooltip && (
					<EventsTooltip
						events={ this.state.eventsByDay }
						context={ this.state.tooltipContext }
						isVisible={ this.state.showTooltip }
					/>
				) }
			</div>
		);
	}
}

export default connect( ( state ) => ( {
	userLocale: getCurrentUserLocale( state ),
} ) )( PostSchedule );
