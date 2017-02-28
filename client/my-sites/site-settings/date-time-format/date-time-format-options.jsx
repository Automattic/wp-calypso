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
import SectionHeader from 'components/section-header';
import DateFormatOption from './date-format-option';
import StartOfWeekOption from './start-of-week-option';
import TimeFormatOption from './time-format-option';
import { defaultDateFormats, defaultTimeFormats } from './default-formats';
import { getNow } from './utils';
import wrapSettingsForm from '../wrap-settings-form';

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

	render() {
		const {
			fields: {
				date_format: dateFormat,
				start_of_week: startOfWeek,
				time_format: timeFormat,
				timezone_string: timezoneString,
			},
			handleSelect,
			handleSubmitForm,
			isRequestingSettings,
			isSavingSettings,
			translate,
		} = this.props;

		const {
			customDateFormat,
			customTimeFormat,
		} = this.state;

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
							disabled={ isRequestingSettings }
							isCustom={ customDateFormat }
							now={ now }
							setCustomDateFormat={ this.setCustomDateFormat }
							setDateFormat={ this.setDateFormat }
						/>
						<TimeFormatOption
							disabled={ isRequestingSettings }
							isCustom={ customTimeFormat }
							now={ now }
							setCustomTimeFormat={ this.setCustomTimeFormat }
							setTimeFormat={ this.setTimeFormat }
							timeFormat={ timeFormat }
						/>
						<StartOfWeekOption
							disabled={ isRequestingSettings }
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
