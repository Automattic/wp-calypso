/* eslint-disable wpcalypso/jsx-classname-namespace */
// disabled CSS class rule due to existing code already
// that users the non-conformant classnames

/**
 * WordPress dependencies
 */
import { dateI18n, __experimentalGetSettings } from '@wordpress/date';
import { __ } from '@wordpress/i18n';
import { Button, DateTimePicker, Dropdown, Placeholder } from '@wordpress/components';

/**
 * Internal dependencies
 */
import { EventCountdownIcon } from './icon';

const edit = ( { attributes, setAttributes, className } ) => {
	const settings = __experimentalGetSettings();

	let label = __( 'Choose Date', 'full-site-editing' );
	if ( attributes.eventDate ) {
		label = dateI18n( settings.formats.datetimeAbbreviated, attributes.eventDate );
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
						<Button
							className="button"
							onClick={ onToggle }
							aria-expanded={ isOpen }
							aria-live="polite"
						>
							{ label }
						</Button>
					) }
					renderContent={ () => (
						<DateTimePicker
							key="event-countdown-picker"
							onChange={ ( eventDate ) => setAttributes( { eventDate } ) }
							currentDate={ attributes.eventDate }
						/>
					) }
				/>
			</div>
		</Placeholder>
	);
};

export default edit;
