/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import { capitalize, includes } from 'lodash';

/**
 * Internal dependencies
 */
import FoldableCard from 'components/foldable-card';
import { withLocalizedMoment } from 'components/localized-moment';
import DateFormatOption from './date-format-option';
import StartOfWeekOption from './start-of-week-option';
import TimeFormatOption from './time-format-option';
import { defaultDateFormats, defaultTimeFormats } from './default-formats';
import { getLocalizedDate, phpToMomentDatetimeFormat } from './utils';

/**
 * Style dependencies
 */
import './style.scss';

export class DateTimeFormat extends Component {
	static propTypes = {
		handleSelect: PropTypes.func.isRequired,
		fields: PropTypes.object,
		isRequestingSettings: PropTypes.bool,
		isSavingSettings: PropTypes.bool,
		updateFields: PropTypes.func.isRequired,
	};

	static defaultProps = {
		fields: {
			date_format: '',
			start_of_week: 0,
			time_format: '',
			timezone_string: '',
		},
		isRequestingSettings: true,
		isSavingSettings: false,
	};

	state = {
		customDateFormat: false,
		customTimeFormat: false,
		isLoadingSettings: true,
	};

	UNSAFE_componentWillReceiveProps( nextProps ) {
		const {
			fields: { date_format: dateFormat, time_format: timeFormat },
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

	setFormat = ( name, defaultFormats ) => ( event ) => {
		const { value: format } = event.currentTarget;
		this.props.updateFields( { [ `${ name }_format` ]: format } );
		this.setState( {
			[ `custom${ capitalize( name ) }Format` ]: ! includes( defaultFormats, format ),
		} );
	};

	setDateFormat = this.setFormat( 'date', defaultDateFormats );

	setTimeFormat = this.setFormat( 'time', defaultTimeFormats );

	setCustomFormat = ( name ) => ( event ) => {
		const { value: format } = event.currentTarget;
		this.props.updateFields( { [ `${ name }_format` ]: format } );
		this.setState( {
			[ `custom${ capitalize( name ) }Format` ]: true,
		} );
	};

	setCustomDateFormat = this.setCustomFormat( 'date' );

	setCustomTimeFormat = this.setCustomFormat( 'time' );

	getCardHeader = () => {
		const {
			fields: {
				date_format: dateFormat,
				start_of_week: startOfWeek,
				time_format: timeFormat,
				timezone_string: timezoneString,
			},
			moment,
			translate,
		} = this.props;

		const localizedDate = getLocalizedDate( timezoneString );
		const weekday = startOfWeek
			? moment.weekdays( parseInt( startOfWeek, 10 ) )
			: moment.weekdays( 0 );

		return (
			<div>
				<div className="date-time-format__title">{ translate( 'Date and Time Format' ) }</div>
				<div className="date-time-format__info">
					{ dateFormat && phpToMomentDatetimeFormat( localizedDate, dateFormat ) } &bull;{ ' ' }
					{ timeFormat && phpToMomentDatetimeFormat( localizedDate, timeFormat ) } &bull;{ ' ' }
					{ translate( 'Week starts on %s', { args: weekday } ) }
				</div>
			</div>
		);
	};

	render() {
		const {
			fields: {
				date_format: dateFormat,
				start_of_week: startOfWeek,
				time_format: timeFormat,
				timezone_string: timezoneString,
			},
			handleSelect,
			isRequestingSettings,
			isSavingSettings,
		} = this.props;

		const { customDateFormat, customTimeFormat } = this.state;

		const localizedDate = getLocalizedDate( timezoneString );

		return (
			<FoldableCard
				className="date-time-format site-settings__foldable-card"
				clickableHeader
				header={ this.getCardHeader() }
			>
				<DateFormatOption
					dateFormat={ dateFormat }
					disabled={ isRequestingSettings || isSavingSettings }
					isCustom={ customDateFormat }
					localizedDate={ localizedDate }
					setCustomDateFormat={ this.setCustomDateFormat }
					setDateFormat={ this.setDateFormat }
				/>
				<TimeFormatOption
					disabled={ isRequestingSettings || isSavingSettings }
					isCustom={ customTimeFormat }
					localizedDate={ localizedDate }
					setCustomTimeFormat={ this.setCustomTimeFormat }
					setTimeFormat={ this.setTimeFormat }
					timeFormat={ timeFormat }
				/>
				<StartOfWeekOption
					disabled={ isRequestingSettings || isSavingSettings }
					onChange={ handleSelect }
					startOfWeek={ startOfWeek }
				/>
			</FoldableCard>
		);
	}
}

export default localize( withLocalizedMoment( DateTimeFormat ) );
