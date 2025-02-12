import { FormLabel, ExternalLink } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { localize } from 'i18n-calypso';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormRadio from 'calypso/components/forms/form-radio';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import FormInput from 'calypso/components/forms/form-text-input';
import { getDefaultTimeFormats } from './default-formats';
import { phpToMomentDatetimeFormat } from './utils';

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
		{ getDefaultTimeFormats().map( ( format ) => (
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
					href={ localizeUrl(
						'https://wordpress.org/documentation/article/customize-date-and-time-format/'
					) }
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
