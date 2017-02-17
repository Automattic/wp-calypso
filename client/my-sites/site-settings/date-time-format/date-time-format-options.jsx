/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import { includes, startsWith } from 'lodash';

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

/**
 * Module constants
 */
const defaultDateFormats = [ 'F j, Y', 'Y-m-d', 'm/d/Y', 'd/m/Y' ];
const defaultTimeFormats = [ 'g:i a', 'g:i A', 'H:i' ];

export class DateTimeFormatOptions extends Component {
	state = {
		customDateFormat: false,
		customTimeFormat: false,
		isLoadingSettings: true,
	};

	isDefaultFormat = ( defaultFormats, format ) => ! includes( defaultFormats, format );

	handleRadio = event => {
		const { name: field, value: format } = event.currentTarget;
		this.props.handleRadio( event );
		if ( 'date_format' === field ) {
			this.setState( {
				customDateFormat: this.isDefaultFormat( defaultDateFormats, format ),
			} );
		} else if ( 'time_format' === field ) {
			this.setState( {
				customTimeFormat: this.isDefaultFormat( defaultTimeFormats, format ),
			} );
		}
	}

	handleInput = field => event => {
		this.props.onChangeField( field )( event );
		if ( 'date_format' === field ) {
			this.setState( { customDateFormat: true } );
		} else if ( 'time_format' === field ) {
			this.setState( { customTimeFormat: true } );
		}
	}

	handleCustomRadio = event => {
		const { name: field } = event.currentTarget;
		if ( 'date_format' === field ) {
			this.setState( { customDateFormat: true } );
		} else if ( 'time_format' === field ) {
			this.setState( { customTimeFormat: true } );
		}
	}

	componentWillReceiveProps( newProps ) {
		const {
			fields: {
				date_format: dateFormat,
				time_format: timeFormat,
			},
		} = newProps;

		if ( ! this.state.isLoadingSettings || '' === dateFormat || '' === timeFormat ) {
			return;
		}

		this.setState( {
			customDateFormat: this.isDefaultFormat( defaultDateFormats, dateFormat ),
			customTimeFormat: this.isDefaultFormat( defaultTimeFormats, timeFormat ),
			isLoadingSettings: false,
		} );
	}

	dateFormatOption() {
		const {
			fields: {
				date_format: dateFormat,
				timezone_string: timezoneString,
			},
			isRequestingSettings,
			moment,
			translate,
		} = this.props;
		const { customDateFormat: isCustomFormat } = this.state;

		const today = startsWith( timezoneString, 'UTC' )
			? moment().utcOffset( timezoneString.substring( 3 ) * 60 )
			: moment.tz( timezoneString );

		return (
			<FormFieldset>
				<FormLabel>
					{ translate( 'Date Format' ) }
				</FormLabel>
				{ defaultDateFormats.map( ( format, key ) =>
					<FormLabel key={ key }>
						<FormRadio
							checked={ ! isCustomFormat && format === dateFormat }
							disabled={ isRequestingSettings }
							name="date_format"
							onChange={ this.handleRadio }
							value={ format }
						/>
						<span>{ today.format( phpToMomentDatetimeFormat( format ) ) }</span>
					</FormLabel>
				) }
				<FormLabel className="date-time-format__custom-field">
					<FormRadio
						checked={ isCustomFormat }
						disabled={ isRequestingSettings }
						name="date_format"
						onChange={ this.handleCustomRadio }
						value={ dateFormat }
					/>
					<span>
						{ translate( 'Custom' ) }
						<FormInput
							disabled={ isRequestingSettings }
							name="date_format_custom"
							onChange={ this.handleInput( 'date_format' ) }
							type="text"
							value={ dateFormat || '' }
						/>
						<span className="date-time-format__custom-preview">
							{ isCustomFormat && dateFormat
								? today.format( phpToMomentDatetimeFormat( dateFormat ) )
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
			fields: {
				time_format: timeFormat,
				timezone_string: timezoneString,
			},
			isRequestingSettings,
			moment,
			translate,
		} = this.props;
		const { customTimeFormat: isCustomFormat } = this.state;

		const today = startsWith( timezoneString, 'UTC' )
			? moment().utcOffset( timezoneString.substring( 3 ) * 60 )
			: moment.tz( timezoneString );

		return (
			<FormFieldset>
				<FormLabel>
					{ translate( 'Time Format' ) }
				</FormLabel>
				{ defaultTimeFormats.map( ( format, key ) =>
					<FormLabel key={ key }>
						<FormRadio
							checked={ ! isCustomFormat && format === timeFormat }
							disabled={ isRequestingSettings }
							name="time_format"
							onChange={ this.handleRadio }
							value={ format }
						/>
						<span>{ today.format( phpToMomentDatetimeFormat( format ) ) }</span>
					</FormLabel>
				) }
				<FormLabel className="date-time-format__custom-field">
					<FormRadio
						checked={ isCustomFormat }
						disabled={ isRequestingSettings }
						name="time_format"
						onChange={ this.handleCustomRadio }
						value={ timeFormat }
					/>
					<span>
						{ translate( 'Custom' ) }
						<FormInput
							disabled={ isRequestingSettings }
							name="time_format_custom"
							onChange={ this.handleInput( 'time_format' ) }
							type="text"
							value={ timeFormat || '' }
						/>
						<span className="date-time-format__custom-preview">
							{ isCustomFormat && timeFormat
								? today.format( phpToMomentDatetimeFormat( timeFormat ) )
								: ''
							}
						</span>
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

	startOfWeekOption() {
		const {
			fields: {
				start_of_week: startOfWeek,
			},
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
					{ translate( 'Week starts on' ) }
				</FormLabel>
				<FormSelect
					disabled={ isRequestingSettings }
					name="start_of_week"
					onChange={ handleSelect }
					value={ startOfWeek || 0 }
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
