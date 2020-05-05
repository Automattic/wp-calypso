/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { noop, pick } from 'lodash';

/**
 * Internal dependencies
 */
import getSiteGmtOffset from 'state/selectors/get-site-gmt-offset';
import getSiteTimezoneValue from 'state/selectors/get-site-timezone-value';
import Popover from 'components/popover';
import PostSchedule from 'components/post-schedule';

/**
 * Style dependencies
 */
import './style.scss';

class CalendarPopover extends Component {
	static propTypes = {
		// connect props
		gmtOffset: PropTypes.number,
		timezoneValue: PropTypes.string,

		// popover props
		autoPosition: PropTypes.bool,
		closeOnEsc: PropTypes.bool,
		ignoreContext: PropTypes.shape( { getDOMNode: PropTypes.function } ),
		isVisible: PropTypes.bool,
		position: PropTypes.string,
		showDelay: PropTypes.number,
		onClose: PropTypes.func,
		onShow: PropTypes.func,

		// calendar props
		events: PropTypes.array,
		selectedDay: PropTypes.object,
		siteId: PropTypes.number,
		onDateChange: PropTypes.func,
		onMonthChange: PropTypes.func,
		onDayMouseEnter: PropTypes.func,
		onDayMouseLeave: PropTypes.func,
	};

	static defaultProps = {
		timezoneValue: '',
		onDateChange: noop,
		onDayMouseEnter: noop,
		onDayMouseLeave: noop,
	};

	state = {
		date: this.props.selectedDay || null,
	};

	setDate = ( date ) => {
		this.setState( { date } );
		this.props.onDateChange( date );
	};

	renderScheduler() {
		const schedulerProps = pick( this.props, [
			'events',
			'posts',
			'site',
			'disabledDays',
			'showOutsideDays',
			'modifiers',
			'onDateChange',
			'onMonthChange',
			'onDayMouseEnter',
			'onDayMouseLeave',
		] );

		return (
			<PostSchedule
				{ ...schedulerProps }
				className="calendar-popover__scheduler"
				selectedDay={ this.state.date }
				gmtOffset={ this.props.gmtOffset }
				timezone={ this.props.timezoneValue }
				onDateChange={ this.setDate }
			/>
		);
	}

	render() {
		const popoverProps = pick( this.props, [
			'autoPosition',
			'closeOnEsc',
			'context',
			'ignoreContext',
			'isVisible',
			'position',
			'showDelay',
			'onClose',
			'onShow',
		] );

		return (
			<Popover { ...popoverProps } className="calendar-popover__popover">
				{ this.renderScheduler() }
			</Popover>
		);
	}
}

export default connect( ( state, { siteId } ) => ( {
	gmtOffset: getSiteGmtOffset( state, siteId ),
	timezoneValue: getSiteTimezoneValue( state, siteId ),
} ) )( CalendarPopover );
