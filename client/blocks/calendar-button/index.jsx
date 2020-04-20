/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component, Fragment } from 'react';
import Gridicon from 'components/gridicon';
import classNames from 'classnames';
import { noop, pick } from 'lodash';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
import AsyncLoad from 'components/async-load';

class CalendarButton extends Component {
	static propTypes = {
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

	setDate = ( date ) => {
		this.setState( { date } );
		this.props.onDateChange( date );
	};

	closePopover = () => {
		this.setState( { showPopover: false } );
		this.props.onClose();
	};

	togglePopover = () => {
		if ( this.props.disabled ) {
			return;
		}

		this.setState( { showPopover: ! this.state.showPopover } );
	};

	buttonRef = React.createRef();

	renderCalendarPopover() {
		if ( ! this.state.showPopover ) {
			return null;
		}

		const calendarProperties = pick( this.props, [
			'autoPosition',
			'closeOnEsc',
			'disabledDays',
			'events',
			'showOutsideDays',
			'ignoreContext',
			'isVisible',
			'modifiers',
			'selectedDay',
			'showDelay',
			'siteId',
			'onDateChange',
			'onMonthChange',
			'onDayMouseEnter',
			'onDayMouseLeave',
			'onShow',
			'onClose',
		] );

		return (
			<AsyncLoad
				{ ...calendarProperties }
				require="blocks/calendar-popover"
				placeholder={ null }
				isVisible
				context={ this.buttonRef.current }
				position={ this.props.popoverPosition }
				onClose={ this.closePopover }
			/>
		);
	}

	renderCalendarContent() {
		return this.props.children ? this.props.children : <Gridicon icon={ this.props.icon } />;
	}

	render() {
		const buttonsProperties = pick( this.props, [
			'compact',
			'disabled',
			'primary',
			'scary',
			'busy',
			'href',
			'borderless',
			'target',
			'rel',
		] );

		return (
			<Fragment>
				<Button
					{ ...buttonsProperties }
					className={ classNames( 'calendar-button', this.props.className ) }
					ref={ this.buttonRef }
					onClick={ this.togglePopover }
				>
					{ this.renderCalendarContent() }
				</Button>
				{ this.renderCalendarPopover() }
			</Fragment>
		);
	}
}

export default CalendarButton;
