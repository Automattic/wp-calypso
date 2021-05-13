/**
 * External dependencies
 */

import React, { Fragment, Component } from 'react';

/**
 * Internal dependencies
 */
import { Card } from '@automattic/components';
import DateRange from '../index.js';

/*
 * Date Range Demo
 */
class DateRangeExample extends Component {
	withCustomTrigger() {
		// Note: you must ensure you pass the `ref` prop down to the element
		const customTrigger = ( props ) => {
			return (
				<button ref={ props.buttonRef } onClick={ props.onTriggerClick }>
					I am a custom Trigger element
				</button>
			);
		};

		return <DateRange renderTrigger={ customTrigger } />;
	}

	withCustomInputs() {
		// Note: you must ensure you pass the `ref` prop down to the element
		const customInputs = ( props ) => {
			return (
				<div>
					<p>
						You selected { props.startDateValue } - { props.endDateValue }
					</p>
				</div>
			);
		};

		return <DateRange renderInputs={ customInputs } />;
	}

	render() {
		const now = new Date();

		return (
			<Fragment>
				<h3>Defaults</h3>
				<Card>
					<DateRange />
				</Card>

				<h3>Compact</h3>
				<Card>
					<DateRange isCompact={ true } />
				</Card>

				<h3>Select only past dates</h3>
				<Card>
					<DateRange lastSelectableDate={ now } />
				</Card>

				<h3>Select only future dates</h3>
				<Card>
					<DateRange firstSelectableDate={ now } />
				</Card>

				<h3>Custom Trigger Component</h3>
				<Card>{ this.withCustomTrigger() }</Card>

				<h3>Custom Inputs Component</h3>
				<Card>{ this.withCustomInputs() }</Card>
			</Fragment>
		);
	}
}

DateRangeExample.displayName = 'DateRange';

export default DateRangeExample;
