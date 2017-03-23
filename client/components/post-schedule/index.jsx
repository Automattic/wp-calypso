/**
 * External dependencies
 */
import React, { PropTypes, Component } from 'react';
import { moment } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import InputChrono from 'components/input-chrono';
import DatePicker from 'components/date-picker';
import QuerySiteSettings from 'components/data/query-site-settings';
import User from 'lib/user';

/**
 * Local dependencies
 */
import Clock from './clock';
import Header from './header';
import utils from './utils';

const user = new User();
const noop = () => {};

class PostSchedule extends Component {
	constructor() {
		super( ...arguments );

		this.state = {
			calendarViewDate: moment(
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
	}

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
		return (
			<div className="post-schedule">
				{
					// Used by Clock for now, likely others in the future.
					this.props.site && <QuerySiteSettings siteId={ this.props.site.ID } />
				}
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
	site: PropTypes.object,
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
