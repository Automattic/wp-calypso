/**
 * External dependencies
 */
import classNames from 'classnames';
import Gridicon from 'gridicons';
import { noop, pick } from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import AsyncLoad from 'components/async-load';
import Button from 'components/button';

class CalendarButton extends Component {
	static propTypes = {
		children: PropTypes.element,
		icon: PropTypes.string,
		popoverPosition: PropTypes.string,
		type: PropTypes.string,

		// calendar-popover properties
		autoPosition: PropTypes.bool,
		closeOnEsc: PropTypes.bool,
		disabledDays: PropTypes.array,
		events: PropTypes.array,
		ignoreContext: PropTypes.shape( { getDOMNode: PropTypes.function } ),
		isVisible: PropTypes.bool,
		rootClassName: PropTypes.string,
		selectedDay: PropTypes.object,
		showDelay: PropTypes.number,
		siteId: PropTypes.number,

		onClose: PropTypes.func,
		onDateChange: PropTypes.func,
		onDayMouseEnter: PropTypes.func,
		onDayMouseLeave: PropTypes.func,
		onMonthChange: PropTypes.func,
		onShow: PropTypes.func,
	};

	static defaultProps = {
		icon: 'calendar',
		type: 'button',
		popoverPosition: 'bottom',
		onDateChange: noop,
		onDayMouseEnter: noop,
		onDayMouseLeave: noop,
		onClose: noop,
	};

	state = { showPopover: false };

	setDate = date => {
		this.setState( { date } );
		this.props.onDateChange( date );
	};

	closePopover = () => {
		this.setState( { showPopover: false } );
		this.props.onClose();
	};

	togglePopover = () => {
		if ( this.props.disabled ) {
			return null;
		}

		return this.setState( { showPopover: ! this.state.showPopover } );
	};

	setPopoverReference = calendarButtonRef => ( this.reference = calendarButtonRef );

	renderCalendarPopover() {
		const { showPopover } = this.state;

		if ( ! showPopover ) {
			return null;
		}

		const calendarProperties = Object.assign( {}, pick( this.props, [
			'autoPosition',
			'closeOnEsc',
			'disabledDays',
			'events',
			'enableOutsideDays',
			'ignoreContext',
			'isVisible',
			'modifiers',
			'rootClassName',
			'selectedDay',
			'showDelay',
			'siteId',
			'onDateChange',
			'onMonthChange',
			'onDayMouseEnter',
			'onDayMouseLeave',
			'onShow',
			'onClose',
		] ) );

		return (
			<AsyncLoad
				{ ...calendarProperties }
				require="blocks/calendar-popover"
				context={ this.reference }
				isVisible={ showPopover }
				position={ this.props.popoverPosition }
				onClose={ this.closePopover }
			/>
		);
	}

	renderCalendarContent() {
		return this.props.children
			? this.props.children
			: ( <Gridicon icon={ this.props.icon } /> );
	}

	render() {
		const buttonsProperties = Object.assign( {}, pick( this.props, [
			'compact',
			'disabled',
			'primary',
			'scary',
			'busy',
			'href',
			'borderless',
			'target',
			'rel',
		] ) );

		return (
			<Button
				{ ...buttonsProperties }
				className={ classNames( 'calendar-button', this.props.className ) }
				ref={ this.setPopoverReference }
				onClick={ this.togglePopover }
			>
				{ this.renderCalendarContent() }
				{ this.renderCalendarPopover() }
			</Button>
		);
	}
}

export default CalendarButton;
