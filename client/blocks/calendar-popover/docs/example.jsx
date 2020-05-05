/**
 * External dependencies
 */
import React, { PureComponent } from 'react';
import moment from 'moment';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
import CalendarPopover from 'blocks/calendar-popover';

const tomorrow = ( date ) => date.date( date.date() + 1 );

class CalendarPopoverExample extends PureComponent {
	buttonRef = React.createRef();

	state = { show: false, currentDate: tomorrow( moment() ) };

	toggle = () => this.setState( { show: ! this.state.show } );

	close = () => this.setState( { show: false } );

	render() {
		return (
			<div>
				<Button primary ref={ this.buttonRef } onClick={ this.toggle }>
					Show Popover
				</Button>

				<CalendarPopover
					context={ this.buttonRef.current }
					isVisible={ this.state.show }
					selectedDay={ this.state.currentDate }
					onClose={ this.close }
				/>
			</div>
		);
	}
}

CalendarPopoverExample.displayName = 'CalendarPopover';

export default CalendarPopoverExample;
