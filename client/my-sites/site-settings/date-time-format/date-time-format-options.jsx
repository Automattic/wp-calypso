/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import { includes, startsWith } from 'lodash';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Card from 'components/card';
import ExternalLink from 'components/external-link';
import FormFieldset from 'components/forms/form-fieldset';
import FormInput from 'components/forms/form-text-input';
import FormLabel from 'components/forms/form-label';
import FormRadio from 'components/forms/form-radio';
import FormSelect from 'components/forms/form-select';
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import SectionHeader from 'components/section-header';
import { phpToMomentDatetimeFormat } from 'lib/formatting';
import wrapSettingsForm from '../wrap-settings-form';

export class DateTimeFormatOptions extends Component {
	dateFormatOption() {
		const {
			fields: { date_format, timezone_string },
			handleRadio,
			isRequestingSettings,
			moment,
			onChangeField,
			translate,
		} = this.props;

		const defaultFormats = [ 'F j, Y', 'Y-m-d', 'm/d/Y', 'd/m/Y' ];
		const isCustomFormat = ! includes( defaultFormats, date_format );
		const today = startsWith( timezone_string, 'UTC' )
			? moment().utcOffset( timezone_string.substring( 3 ) * 60 )
			: moment.tz( timezone_string );

		const customFieldClasses = classNames(
			'date-time-format__custom-field',
			{ 'is-custom': isCustomFormat }
		);

		return (
			<FormFieldset>
				<FormLabel>
					{ translate( 'Date Format' ) }
				</FormLabel>
				{ defaultFormats.map( ( format, key ) =>
					<FormLabel key={ key }>
						<FormRadio
							checked={ format === date_format }
							disabled={ isRequestingSettings }
							name="date_format"
							onChange={ handleRadio }
							value={ format }
						/>
						<span>{ today.format( phpToMomentDatetimeFormat( format ) ) }</span>
					</FormLabel>
				) }
				<FormLabel className={ customFieldClasses }>
					<FormRadio
						checked={ isCustomFormat }
						disabled={ isRequestingSettings }
						name="date_format"
						onChange={ handleRadio }
						value={ date_format }
					/>
					<span>
						{ translate( 'Custom' ) }
						<FormInput
							disabled={ isRequestingSettings }
							name="date_format_custom"
							onChange={ onChangeField( 'date_format' ) }
							type="text"
							value={ date_format || '' }
						/>
						<span className="date-time-format__custom-preview">
							{ isCustomFormat && date_format
								? today.format( phpToMomentDatetimeFormat( date_format ) )
								: ''
							}
						</span>
				</span>
				</FormLabel>
			</FormFieldset>
		);
	}

	timeFormatOption() {
		const {
			fields: { time_format, timezone_string },
			handleRadio,
			isRequestingSettings,
			moment,
			onChangeField,
			translate,
		} = this.props;

		const defaultFormats = [ 'g:i a', 'g:i A', 'H:i' ];
		const isCustomFormat = ! includes( defaultFormats, time_format );
		const today = startsWith( timezone_string, 'UTC' )
			? moment().utcOffset( timezone_string.substring( 3 ) * 60 )
			: moment.tz( timezone_string );

		const customFieldClasses = classNames(
			'date-time-format__custom-field',
			{ 'is-custom': isCustomFormat }
		);

		return (
			<FormFieldset>
				<FormLabel>
					{ translate( 'Time Format' ) }
				</FormLabel>
				{ defaultFormats.map( ( format, key ) =>
					<FormLabel key={ key }>
						<FormRadio
							checked={ format === time_format }
							disabled={ isRequestingSettings }
							name="time_format"
							onChange={ handleRadio }
							value={ format }
						/>
						<span>{ today.format( phpToMomentDatetimeFormat( format ) ) }</span>
					</FormLabel>
				) }
				<FormLabel className={ customFieldClasses }>
					<FormRadio
						checked={ isCustomFormat }
						disabled={ isRequestingSettings }
						name="time_format"
						onChange={ handleRadio }
						value={ time_format }
					/>
					<span>
						{ translate( 'Custom' ) }
						<FormInput
							disabled={ isRequestingSettings }
							name="time_format_custom"
							onChange={ onChangeField( 'time_format' ) }
							type="text"
							value={ time_format || '' }
						/>
						<span className="date-time-format__custom-preview">
							{ isCustomFormat && time_format
								? today.format( phpToMomentDatetimeFormat( time_format ) )
								: ''
							}
						</span>
					</span>
					<FormSettingExplanation>
						<ExternalLink href="https://codex.wordpress.org/Formatting_Date_and_Time" icon>
							{ translate( 'Documentation on date and time formatting.' ) }
						</ExternalLink>
					</FormSettingExplanation>
				</FormLabel>
			</FormFieldset>
		);
	}

	startOfWeekOption() {
		const {
			fields: { start_of_week },
			handleSelect,
			isRequestingSettings,
			translate,
		} = this.props;

		const daysOfWeek = [
			translate( 'Sunday' ),
			translate( 'Monday' ),
			translate( 'Tuesday' ),
			translate( 'Wednesday' ),
			translate( 'Thursday' ),
			translate( 'Friday' ),
			translate( 'Saturday' ),
		];

		return (
			<FormFieldset>
				<FormLabel>
					{ translate( 'Week Starts On' ) }
				</FormLabel>
				<FormSelect
					disabled={ isRequestingSettings }
					name="start_of_week"
					onChange={ handleSelect }
					value={ start_of_week || 0 }
				>
					{ daysOfWeek.map( ( day, index ) =>
						<option key={ index } value={ index }>
							{ day }
						</option>
					) }
				</FormSelect>
			</FormFieldset>
		);
	}

	render() {
		const {
			handleSubmitForm,
			isRequestingSettings,
			isSavingSettings,
			translate,
		} = this.props;

		return (
			<div>
				<SectionHeader>
					<Button
						compact={ true }
						onClick={ handleSubmitForm }
						primary={ true }
						type="submit"
						disabled={ isRequestingSettings || isSavingSettings }>
							{ isSavingSettings
								? translate( 'Saving…' )
								: translate( 'Save Settings' )
							}
					</Button>
				</SectionHeader>
				<Card>
					<form>
						{ this.dateFormatOption() }
						{ this.timeFormatOption() }
						{ this.startOfWeekOption() }
					</form>
				</Card>
			</div>
		);
	}
}

export default wrapSettingsForm( settings => {
	const defaultSettings = {
		date_format: '',
		start_of_week: 0,
		time_format: '',
		timezone_string: '',
	};

	if ( ! settings ) {
		return defaultSettings;
	}

	const formSettings = {
		date_format: settings.date_format,
		start_of_week: settings.start_of_week,
		time_format: settings.time_format,
		timezone_string: settings.timezone_string,
	};

	// handling `gmt_offset` and `timezone_string` values
	const gmt_offset = settings.gmt_offset;

	if (
		! settings.timezone_string &&
		typeof gmt_offset === 'string' &&
		gmt_offset.length
	) {
		formSettings.timezone_string = 'UTC' +
			( /\-/.test( gmt_offset ) ? '' : '+' ) +
			gmt_offset;
	}

	return formSettings;
} )( localize( DateTimeFormatOptions ) );
