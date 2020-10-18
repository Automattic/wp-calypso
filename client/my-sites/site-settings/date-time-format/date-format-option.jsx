/**
 * External dependencies
 */

import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormInput from 'calypso/components/forms/form-text-input';
import FormLabel from 'calypso/components/forms/form-label';
import FormRadio from 'calypso/components/forms/form-radio';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import { defaultDateFormats } from './default-formats';
import { phpToMomentDatetimeFormat } from './utils';

export const DateFormatOption = ( {
	dateFormat,
	disabled,
	isCustom,
	localizedDate,
	setCustomDateFormat,
	setDateFormat,
	translate,
} ) => (
	<FormFieldset>
		<FormLabel>{ translate( 'Date Format' ) }</FormLabel>
		{ defaultDateFormats.map( ( format ) => (
			<FormLabel key={ format }>
				<FormRadio
					checked={ ! isCustom && format === dateFormat }
					disabled={ disabled }
					name="date_format"
					onChange={ setDateFormat }
					value={ format }
					label={ phpToMomentDatetimeFormat( localizedDate, format ) }
				/>
			</FormLabel>
		) ) }
		<FormLabel className="date-time-format__custom-field">
			<FormRadio
				checked={ isCustom }
				disabled={ disabled }
				name="date_format"
				onChange={ setCustomDateFormat }
				value={ dateFormat }
				label={
					<>
						{ translate( 'Custom', { comment: 'Custom date/time format field' } ) }
						<FormInput
							disabled={ disabled }
							name="date_format_custom"
							onChange={ setCustomDateFormat }
							value={ dateFormat || '' }
						/>
						<FormSettingExplanation>
							{ isCustom &&
								dateFormat &&
								translate( 'Preview: %s', {
									args: phpToMomentDatetimeFormat( localizedDate, dateFormat ),
									comment: 'Date/time format preview',
								} ) }
						</FormSettingExplanation>
					</>
				}
			/>
		</FormLabel>
	</FormFieldset>
);

export default localize( DateFormatOption );
