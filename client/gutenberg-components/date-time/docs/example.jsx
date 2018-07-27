/** @format */

/**
 * External dependencies
 */
import React from 'react';
import { DateTimePicker } from '@wordpress/components';
import noop from 'lodash';

DateTimePicker.displayName = 'DateTimePicker';

export default class extends React.Component {
	static displayName = 'DateTimePicker';

	static defaultProps = {
		exampleCode: ''
	};

	render() {
		return (
			<div className="docs__gutenberg-components-datepicker">
				<DateTimePicker
					currentDate={ new Date() }
					onChange={ noop }
					locale={ 'en-US' }
					is12Hour
				/>
			</div>
		);
	}
}
