/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import FormFieldset from 'components/forms/form-fieldset';
import FormInput from 'components/forms/form-text-input';
import FormLabel from 'components/forms/form-label';
import FormRadio from 'components/forms/form-radio';
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import { phpToMomentDatetimeFormat } from 'lib/formatting';

/**
 * Module constant
 */
const defaultDateFormats = [
	'F j, Y',
	'Y-m-d',
	'm/d/Y',
	'd/m/Y',
];

export const DateFormatOption = ( {
	dateFormat,
	isCustomFormat,
	isRequestingSettings,
	now,
	setDateFormat,
	setCustomDateFormat,
	translate,
} ) => (
	<FormFieldset>
		<FormLabel>
			{ translate( 'Date Format' ) }
		</FormLabel>
		{ defaultDateFormats.map( ( format, index ) =>
			<FormLabel key={ index }>
				<FormRadio
					checked={ ! isCustomFormat && format === dateFormat }
					disabled={ isRequestingSettings }
					name="date_format"
					onChange={ setDateFormat }
					value={ format }
				/>
				<span>{ now.format( phpToMomentDatetimeFormat( format ) ) }</span>
			</FormLabel>
		) }
		<FormLabel className="date-time-format__custom-field">
			<FormRadio
				checked={ isCustomFormat }
				disabled={ isRequestingSettings }
				name="date_format"
				onChange={ setCustomDateFormat }
				value={ dateFormat }
			/>
			<span>
				{ translate( 'Custom', { comment: 'Custom date/time format field' } ) }
				<FormInput
					disabled={ isRequestingSettings }
					name="date_format_custom"
					onChange={ setCustomDateFormat }
					type="text"
					value={ dateFormat || '' }
				/>
				<FormSettingExplanation>
					{ isCustomFormat && dateFormat
						? translate( 'Preview: %s', {
							args: now.format( phpToMomentDatetimeFormat( dateFormat ) ),
							comment: 'Date/time format preview',
						} )
						: ''
					}
				</FormSettingExplanation>
			</span>
		</FormLabel>
	</FormFieldset>
);

export default localize( DateFormatOption );
