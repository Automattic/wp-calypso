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

export default props => <div>
	<SectionHeader label="We’re Open"></SectionHeader>
	<Card>
		<dl>
			<dt>Monday – Friday</dt>
			<dd>11AM—7PM</dd>
			<dt>Saturday and Sunday</dt>
			<dd>Closed</dd>
		</dl>
	</Card>
</div>;

export const EditWorkingHours = props => <div>
	{
		[ 'Monday', 'Tuesday',  'Wednesday',  'Thursday', 'Friday',  'Saturday',  'Sunday' ]
			.map( day => <FormFieldset>
					<FormLabel>{ day }</FormLabel>
					<FormTextInput placeholder="8am - 7pm"/>
				</FormFieldset>
		)
	}
</div>;
