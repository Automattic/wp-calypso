/** @format */

/**
 * External dependencies
 */

import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import FormFieldset from 'client/components/forms/form-fieldset';
import FormLabel from 'client/components/forms/form-label';
import FormSelect from 'client/components/forms/form-select';

export const StartOfWeekOption = ( { disabled, moment, onChange, startOfWeek, translate } ) => (
	<FormFieldset>
		<FormLabel>{ translate( 'Week starts on' ) }</FormLabel>
		<FormSelect
			disabled={ disabled }
			name="start_of_week"
			onChange={ onChange }
			value={ startOfWeek || 0 }
		>
			{ moment.weekdays().map( ( day, index ) => (
				<option key={ day } value={ index }>
					{ day }
				</option>
			) ) }
		</FormSelect>
	</FormFieldset>
);

export default localize( StartOfWeekOption );
