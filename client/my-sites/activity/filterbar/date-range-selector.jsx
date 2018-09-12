/** @format */
/**
 * External dependencies
 */
import React, { Component, Fragment } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import CalendarPopover from 'blocks/calendar-popover';

export class DateRangeSelector extends Component {
	constructor( props ) {
		super( props );
		this.dateRangeButton = React.createRef();
	}

	render() {
		const { translate, isVisible, onButtonClick } = this.props;
		return (
			<Fragment>
				<Button
					className="filterbar__selection"
					compact
					borderless
					onClick={ onButtonClick }
					ref={ this.dateRangeButton }
				>
					{ translate( 'Date Range' ) }
				</Button>
				<CalendarPopover context={ this.dateRangeButton.current } isVisible={ isVisible } />
			</Fragment>
		);
	}
}

export default localize( DateRangeSelector );
