/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import DateRange from '../index.js';

/*
 * Date Range Demo
 */
class DateRangeExample extends Component {
	render() {
		return (
			<Card style={ { width: '300px', margin: 0 } }>
				<DateRange />
			</Card>
		);
	}
}

DateRangeExample.displayName = 'DateRange';

export default DateRangeExample;
