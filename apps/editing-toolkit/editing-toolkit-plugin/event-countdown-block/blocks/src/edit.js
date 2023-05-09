/* eslint-disable wpcalypso/jsx-classname-namespace */
// disabled CSS class rule due to existing code already
// that users the non-conformant classnames

import { Button, DateTimePicker, Dropdown, Placeholder } from '@wordpress/components';
import { dateI18n, __experimentalGetSettings } from '@wordpress/date';
import { __ } from '@wordpress/i18n';
import moment from 'moment';
import { EventCountdownIcon } from './icon';

const TIMEZONELESS_FORMAT = 'YYYY-MM-DDTHH:mm:ss';

/**
 * Assigns timezone to a date without altering it
 *
 * @param {string} date a date in YYYY-MM-DDTHH:mm:ss format
 * @param {number} offset the offset in hours
 * @returns a moment instance
 */
function assignTimezone( date, offset, format = TIMEZONELESS_FORMAT ) {
	// passing the `true` flag to `utcOffset` keeps the date unaltered, only adds a tz
	return moment( date, format ).utcOffset( offset * 60, true );
}

const edit = ( { attributes, setAttributes, className } ) => {
	const settings = __experimentalGetSettings();

	let label = __( 'Choose Date', 'full-site-editing' );
	let eventDate;

	if ( attributes.eventTimestamp ) {
		label = dateI18n(
			settings.formats.datetimeAbbreviated,
			// eventTimestamp is UNIX (in seconds), Date expect milliseconds
			new Date( attributes.eventTimestamp * 1000 )
		);

		// the DateTimePicker requires the date to be in this format
		// we offset the date by the site timezone settings to counteract the Datepicker automatic adjustment to the client-side timezone
		eventDate = moment( attributes.eventTimestamp * 1000 )
			.utcOffset( settings.timezone.offset * 60 )
			.format( TIMEZONELESS_FORMAT );
	} else if ( attributes.eventDate ) {
		// backwards compatibility
		const siteTimeZoneAdjustedTime = assignTimezone(
			attributes.eventDate,
			Number.parseFloat( settings.timezone.offset ) // offset can be a string if a manual timezone is selected
		);

		label = dateI18n( settings.formats.datetimeAbbreviated, siteTimeZoneAdjustedTime );
		eventDate = attributes.eventDate;
	}

	return (
		<Placeholder
			label={ __( 'Event Countdown', 'full-site-editing' ) }
			instructions={ __(
				'Count down to an event. Set a title and pick a time and date.',
				'full-site-editing'
			) }
			icon={ <EventCountdownIcon /> }
			className={ className }
		>
			<div>
				<strong>{ __( 'Title:', 'full-site-editing' ) }</strong>
				<br />
				<input
					type="text"
					value={ attributes.eventTitle }
					onChange={ ( evt ) => setAttributes( { eventTitle: evt.target.value } ) }
					placeholder={ __( 'Event Title', 'full-site-editing' ) }
					className="event-countdown__event-title"
					aria-label={ __( 'Event Title', 'full-site-editing' ) }
				/>
			</div>
			<div>
				<strong>{ __( 'Date:', 'full-site-editing' ) }</strong>
				<br />
				<Dropdown
					position="bottom left"
					renderToggle={ ( { onToggle, isOpen } ) => (
						<Button onClick={ onToggle } aria-expanded={ isOpen } aria-live="polite" isSecondary>
							{ label }
						</Button>
					) }
					renderContent={ () => (
						<DateTimePicker
							key="event-countdown-picker"
							onChange={ ( date ) =>
								setAttributes( {
									eventTimestamp: assignTimezone( date, settings.timezone.offset ).unix(),
								} )
							}
							currentDate={ eventDate }
						/>
					) }
				/>
			</div>
		</Placeholder>
	);
};

export default edit;
