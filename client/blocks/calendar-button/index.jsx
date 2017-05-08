/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import Gridicon from 'gridicons';
import classNames from 'classnames';
import { noop, pick } from 'lodash';
/**
 * Internal dependencies
 */
import Button from 'components/button';
import AsyncLoad from 'components/async-load';

class CalendarButton extends Component {
	static propTypes = {
		children: PropTypes.element,
		icon: PropTypes.string,
		popoverPosition: PropTypes.string,
		type: PropTypes.string,

		// calendar-popover properties
		autoPosition: PropTypes.bool,
		closeOnEsc: PropTypes.bool,
		events: PropTypes.array,
		ignoreContext: PropTypes.shape( { getDOMNode: React.PropTypes.function } ),
		isVisible: PropTypes.bool,
		rootClassName: PropTypes.string,
		selectedDay: PropTypes.object,
		showDelay: PropTypes.number,
		siteId: PropTypes.number,

		onClose: PropTypes.func,
		onDateChange: PropTypes.func,
		onMonthChange: PropTypes.func,
		onShow: PropTypes.func,
	};

	static defaultProps = {
		icon: 'calendar',
		type: 'button',
		popoverPosition: 'bottom',
		onDateChange: noop,
	};

	state = { showPopover: false };

	setDate = date => {
		this.setState( { date } );
		this.props.onDateChange( date );
	};

	closePopover = () => this.setState( { showPopover: false } );

	togglePopover = () => this.setState( { showPopover: ! this.state.showPopover } );

	setPopoverReference = calendarButtonRef => ( this.reference = calendarButtonRef );

	renderCalendarPopover() {
		const { showPopover } = this.state;

		if ( ! showPopover ) {
			return null;
		}

		const calendarProperties = Object.assign( {}, pick( this.props, [
			'autoPosition',
			'closeOnEsc',
			'events',
			'ignoreContext',
			'isVisible',
			'rootClassName',
			'selectedDay',
			'showDelay',
			'siteId',
			'onDateChange',
			'onMonthChange',
			'onShow',
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
