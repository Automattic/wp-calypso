/**
 * External dependencies
 */
import { moment } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import Clock from './clock';
import Header from './header';
import utils from './utils';
import QuerySiteSettings from 'components/data/query-site-settings';
import DatePicker from 'components/date-picker';
import EventsTooltip from 'components/date-picker/events-tooltip';
import InputChrono from 'components/input-chrono';
import User from 'lib/user';

const user = new User();
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
			const localDate = this.getDateToUserLocation( post.date );

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

	setCurrentMonth = ( date ) => {
		date = moment( date );
		this.props.onMonthChange( date );
		this.setState( { calendarViewDate: date } );
	}

	setViewDate = ( date ) => {
		this.setState( { calendarViewDate: moment( date ) } );
	}

	getCurrentDate() {
		return moment( this.state.localizedDate || this.getDateToUserLocation() );
	}

	updateDate = ( date ) => {
		this.setState( { calendarViewDate: date } );

		this.props.onDateChange( utils.convertDateToGivenOffset(
			date,
			this.props.timezone,
			this.props.gmtOffset
		) );
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
		const lang = user.getLanguage();
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
				siteId={ this.props.site ? this.props.site.ID : null }
				siteSlug={ this.props.site ? this.props.site.slug : null }
				onChange={ this.updateDate }
			/>
		);
	}

	render() {
		const handleEventsTooltip = ! this.props.events || ! this.props.events.length;

		return (
			<div className="post-schedule">
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
					locale={ this.locale() }
					disabledDays={ this.props.disabledDays }
					enableOutsideDays={ this.props.enableOutsideDays }
					modifiers={ this.props.modifiers }
					selectedDay={
						this.state.localizedDate
							? this.state.localizedDate.toDate()
							: null
					}

					timeReference={ this.getCurrentDate() }
					calendarViewDate={ this.state.calendarViewDate.toDate() }

					onMonthChange={ this.setCurrentMonth }
					onSelectDay={ this.updateDate }
					onDayMouseEnter={ this.handleOnDayMouseEnter }
					onDayMouseLeave={ this.handleOnDayMouseLeave }
				/>

				{ this.renderClock() }

				{
					handleEventsTooltip &&
					<EventsTooltip
						events={ this.state.eventsByDay }
						context={ this.state.tooltipContext }
						isVisible={ this.state.showTooltip }
					/>
				}
			</div>
		);
	}
}

export default PostSchedule;
