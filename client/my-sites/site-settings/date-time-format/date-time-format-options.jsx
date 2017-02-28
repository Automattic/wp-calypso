/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import { capitalize, includes } from 'lodash';

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
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import SectionHeader from 'components/section-header';
import DateFormatOption from './date-format-option';
import StartOfWeekOption from './start-of-week-option';
import { phpToMomentDatetimeFormat } from 'lib/formatting';
import { getNow } from './utils';
import wrapSettingsForm from '../wrap-settings-form';

/**
 * Module constants
 */
const defaultDateFormats = [
	'F j, Y',
	'Y-m-d',
	'm/d/Y',
	'd/m/Y',
];

const defaultTimeFormats = [
	'g:i a',
	'g:i A',
	'H:i',
];

export class DateTimeFormatOptions extends Component {
	state = {
		customDateFormat: false,
		customTimeFormat: false,
		isLoadingSettings: true,
	};

	componentWillReceiveProps( nextProps ) {
		const {
			fields: {
				date_format: dateFormat,
				time_format: timeFormat,
			},
		} = nextProps;

		if ( ! this.state.isLoadingSettings || '' === dateFormat || '' === timeFormat ) {
			return;
		}

		this.setState( {
			customDateFormat: ! includes( defaultDateFormats, dateFormat ),
			customTimeFormat: ! includes( defaultTimeFormats, timeFormat ),
			isLoadingSettings: false,
		} );
	}

	setFormat = ( name, defaultFormats ) => event => {
		const { value: format } = event.currentTarget;
		this.props.updateFields( { [ `${ name }_format` ]: format } );
		this.setState( {
			[ `custom${ capitalize( name ) }Format` ]: ! includes( defaultFormats, format ),
		} );
	};

	setDateFormat = this.setFormat( 'date', defaultDateFormats );

	setTimeFormat = this.setFormat( 'time', defaultTimeFormats );

	setCustomFormat = name => event => {
		const { value: format } = event.currentTarget;
		this.props.updateFields( { [ `${ name }_format` ]: format } );
		this.setState( {
			[ `custom${ capitalize( name ) }Format` ]: true,
		} );
	};

	setCustomDateFormat = this.setCustomFormat( 'date' );

	setCustomTimeFormat = this.setCustomFormat( 'time' );

	timeFormatOption() {
		const {
			fields: {
				time_format: timeFormat,
				timezone_string: timezoneString,
			},
			isRequestingSettings,
			translate,
		} = this.props;
		const { customTimeFormat: isCustomFormat } = this.state;

		const now = getNow( timezoneString );

		return (
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
							onChange={ this.setTimeFormat }
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
						onChange={ this.setCustomTimeFormat }
						value={ timeFormat }
					/>
					<span>
						{ translate( 'Custom', { comment: 'Custom date/time format field' } ) }
						<FormInput
							disabled={ isRequestingSettings }
							name="time_format_custom"
							onChange={ this.setCustomTimeFormat }
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
	}

	render() {
		const {
			fields: {
				date_format: dateFormat,
				start_of_week: startOfWeek,
				timezone_string: timezoneString,
			},
			handleSelect,
			handleSubmitForm,
			isRequestingSettings,
			isSavingSettings,
			translate,
		} = this.props;

		const { customDateFormat } = this.state;

		const now = getNow( timezoneString );

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
						<DateFormatOption
							dateFormat={ dateFormat }
							isCustomFormat={ customDateFormat }
							isRequestingSettings={ isRequestingSettings }
							now={ now }
							setDateFormat={ this.setDateFormat }
							setCustomDateFormat={ this.setCustomDateFormat }
						/>
						{ this.timeFormatOption() }
						<StartOfWeekOption
							isRequestingSettings={ isRequestingSettings }
							onChange={ handleSelect }
							startOfWeek={ startOfWeek }
						/>
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
