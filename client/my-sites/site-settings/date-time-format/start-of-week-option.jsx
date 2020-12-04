/**
 * External dependencies
 */
import React from 'react';
import { useTranslate } from 'i18n-calypso';
import { useLocalizedMoment } from 'calypso/components/localized-moment';

/**
 * Internal dependencies
 */
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLabel from 'calypso/components/forms/form-label';
import FormSelect from 'calypso/components/forms/form-select';

export const StartOfWeekOption = ( { disabled, onChange, startOfWeek } ) => {
	const translate = useTranslate();
	const moment = useLocalizedMoment();

	return (
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
};

export default StartOfWeekOption;
