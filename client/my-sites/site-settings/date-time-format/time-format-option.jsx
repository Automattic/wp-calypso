/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import ExternalLink from 'components/external-link';
import FormFieldset from 'components/forms/form-fieldset';
import FormInput from 'components/forms/form-text-input';
import FormLabel from 'components/forms/form-label';
import FormRadio from 'components/forms/form-radio';
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import { phpToMomentDatetimeFormat } from 'lib/formatting';

/**
 * Module constant
 */
const defaultTimeFormats = [
	'g:i a',
	'g:i A',
	'H:i',
];

export const TimeFormatOption = ( {
	timeFormat,
	isCustomFormat,
	isRequestingSettings,
	now,
	setTimeFormat,
	setCustomTimeFormat,
	translate,
} ) => (
	<FormFieldset>
		<FormLabel>
			{ translate( 'Time Format' ) }
		</FormLabel>
		{ defaultTimeFormats.map( ( format, index ) =>
			<FormLabel key={ index }>
				<FormRadio
					checked={ ! isCustomFormat && format === timeFormat }
					disabled={ isRequestingSettings }
					name="time_format"
					onChange={ setTimeFormat }
					value={ format }
				/>
				<span>{ now.format( phpToMomentDatetimeFormat( format ) ) }</span>
			</FormLabel>
		) }
		<FormLabel className="date-time-format__custom-field">
			<FormRadio
				checked={ isCustomFormat }
				disabled={ isRequestingSettings }
				name="time_format"
				onChange={ setCustomTimeFormat }
				value={ timeFormat }
			/>
			<span>
				{ translate( 'Custom', { comment: 'Custom date/time format field' } ) }
				<FormInput
					disabled={ isRequestingSettings }
					name="time_format_custom"
					onChange={ setCustomTimeFormat }
					type="text"
					value={ timeFormat || '' }
				/>
				<FormSettingExplanation>
					{ isCustomFormat && timeFormat
						? translate( 'Preview: %s', {
							args: now.format( phpToMomentDatetimeFormat( timeFormat ) ),
							comment: 'Date/time format preview'
						} )
						: ''
					}
				</FormSettingExplanation>
			</span>
			<FormSettingExplanation>
				<ExternalLink
					href="https://codex.wordpress.org/Formatting_Date_and_Time"
					icon
					target="_blank"
				>
					{ translate( 'Learn more about date and time formatting.' ) }
				</ExternalLink>
			</FormSettingExplanation>
		</FormLabel>
	</FormFieldset>
);

export default localize( TimeFormatOption );
