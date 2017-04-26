/**
 * External dependencies
 */
import React from 'react';
import Card from 'components/card';
import SectionHeader from 'components/section-header';

/**
 * Internal dependencies
 */
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormTextInput from 'components/forms/form-text-input';
import Button from 'components/button';
import { enterBusinessName, enterBusinessDescription } from 'state/pandance/actions';

export const WorkingHours = props => <div className="hours section">
	<Card>
		<h3 className="section-title">Hours</h3>
		<table className="hours-table">
			<tr>
				<td>Monday</td>
				<td>11AM—7PM</td>
			</tr>
			<tr>
				<td>Tuesday</td>
				<td>11AM—7PM</td>
			</tr>
			<tr>
				<td>Wednesday</td>
				<td>11AM—7PM</td>
			</tr>
			<tr>
				<td>Thursday</td>
				<td>11AM—7PM</td>
			</tr>
			<tr>
				<td>Friday</td>
				<td>11AM—7PM</td>
			</tr>
			<tr>
				<td>Saturday</td>
				<td>11AM—7PM</td>
			</tr>
			<tr>
				<td>Sunday</td>
				<td>Closed</td>
			</tr>
		</table>

	</Card>
</div>;

export const EditWorkingHours = props => <div className="wrapper">
	{
		[ 'Monday', 'Tuesday',  'Wednesday',  'Thursday', 'Friday',  'Saturday',  'Sunday' ]
			.map( day => <FormFieldset>
					<FormLabel>{ day }</FormLabel>
					<FormTextInput placeholder="8am - 7pm"/>
				</FormFieldset>
		)
	}
</div>;
