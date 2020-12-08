/**
 * External dependencies
 */

import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import ExternalLink from 'calypso/components/external-link';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormInput from 'calypso/components/forms/form-text-input';
import FormLabel from 'calypso/components/forms/form-label';
import FormRadio from 'calypso/components/forms/form-radio';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import { defaultTimeFormats } from './default-formats';
import { phpToMomentDatetimeFormat } from './utils';
import { localizeUrl } from 'calypso/lib/i18n-utils';

export const TimeFormatOption = ( {
	disabled,
	isCustom,
	localizedDate,
	setCustomTimeFormat,
	setTimeFormat,
	timeFormat,
	translate,
} ) => (
	<FormFieldset>
		<FormLabel>{ translate( 'Time Format' ) }</FormLabel>
		{ defaultTimeFormats.map( ( format ) => (
			<FormLabel key={ format }>
				<FormRadio
					checked={ ! isCustom && format === timeFormat }
					disabled={ disabled }
					name="time_format"
					onChange={ setTimeFormat }
					value={ format }
					label={ phpToMomentDatetimeFormat( localizedDate, format ) }
				/>
			</FormLabel>
		) ) }
		<FormLabel className="date-time-format__custom-field">
			<FormRadio
				checked={ isCustom }
				disabled={ disabled }
				name="time_format"
				onChange={ setCustomTimeFormat }
				value={ timeFormat }
				label={
					<>
						{ translate( 'Custom', { comment: 'Custom date/time format field' } ) }
						<FormInput
							disabled={ disabled }
							name="time_format_custom"
							onChange={ setCustomTimeFormat }
							value={ timeFormat || '' }
						/>
						<FormSettingExplanation>
							{ isCustom &&
								timeFormat &&
								translate( 'Preview: %s', {
									args: phpToMomentDatetimeFormat( localizedDate, timeFormat ),
									comment: 'Date/time format preview',
								} ) }
						</FormSettingExplanation>
					</>
				}
			/>
			<FormSettingExplanation>
				<ExternalLink
					href={ localizeUrl( 'https://wordpress.com/support/settings/time-settings/' ) }
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
