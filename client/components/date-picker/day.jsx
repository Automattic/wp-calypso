/**
 * External Dependencies
 */
import React, { PropTypes, Component } from 'react';
import { noop, map } from 'lodash';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Tooltip from 'components/tooltip';
import { CalendarEvent } from './event';

class DatePickerDay extends Component {
	static propTypes = {
		date: PropTypes.object.isRequired,
		events: PropTypes.array,
		moment: PropTypes.func,
		maxEventsPerTooltip: PropTypes.number,
	};

	static defaultProps = {
		maxEventsPerTooltip: 8,
	};

	state = {
		showTooltip: false,
	};

	isPastDay( date ) {
		const today = this.props.moment().set( {
			hour: 0,
			minute: 0,
			second: 0,
			millisecond: 0
		} );

		date = date || this.props.date;
		return ( +today - 1 ) >= +date;
	}

	showTooltip = () => {
		if ( ! this.props.events.length ) {
			return;
		}

		this.setState( { showTooltip: true } );
	}

	hideTooltip = () => {
		this.setState( { showTooltip: false } );
	}

	renderTooltip() {
		if ( ! this.state.showTooltip ) {
			return null;
		}

		if ( ! this.props.events.length ) {
			return null;
		}

		const label = this.props.translate(
			'%d post',
			'%d posts', {
				count: this.props.events.length,
				args: this.props.events.length,
			}
		);

		const moreEvents = this.props.events.length - this.props.maxEventsPerTooltip;

		return (
			<Tooltip
				className="date-picker__events-tooltip"
				context={ this.refs.dayTarget }
				isVisible={ this.state.showTooltip }
				onClose={ noop }
			>
				<span>{ label }</span>
				<hr className="date-picker__division" />
				<ul>
					{ map( this.props.events, ( event, i ) => ( i < this.props.maxEventsPerTooltip ) &&
						<li key={ event.id }>
							<CalendarEvent
								icon={ event.icon }
								socialIcon={ event.socialIcon }
								socialIconColor={ event.socialIconColor }
								title={ event.title } />
						</li>
					) }

					{ ( moreEvents > 0 ) &&
						<li>
							{ this.props.translate(
								'… and %(moreEvents)d more post',
								'… and %(moreEvents)d more posts', {
									count: moreEvents,
									args: {
										moreEvents
									}
								}
							) }
						</li>
					}
				</ul>
			</Tooltip>
		);
	}

	render() {
		const classes = { 'date-picker__day': true };
		let i = 0;
		let dayEvent;

		classes[ 'is-selected' ] = this.props.selected === true;
		classes[ 'past-day' ] = this.isPastDay() === true;

		if ( this.props.events.length ) {
			classes[ 'date-picker__day_event' ] = true;

			for ( i; i < this.props.events.length; i++ ) {
				dayEvent = this.props.events[ i ];

				if (
					dayEvent.type &&
					( ! classes[ 'date-picker__day_event_' + dayEvent.type ] )
				) {
					classes[ 'date-picker__day_event_' + dayEvent.type ] = true;
				}
			}
		}

		return (
			<div
				ref="dayTarget"
				className={ classNames( classes ) }
				onMouseEnter={ this.showTooltip }
				onMouseLeave={ this.hideTooltip }
			>
				<span
					key={ 'selected-' + ( this.props.date.getTime() / 1000 | 0 ) }
					className="date-picker__day-selected">
				</span>
				<span className="date-picker__day-text">
					{ this.props.date.getDate() }
				</span>

				{ this.renderTooltip() }
			</div>
		);
	}
}

export default localize( DatePickerDay );

