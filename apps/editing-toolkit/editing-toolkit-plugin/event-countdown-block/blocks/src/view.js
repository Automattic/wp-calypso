/* eslint-disable wpcalypso/jsx-classname-namespace */
// disabled CSS class rule due to existing code already
// that users the non-conformant classnames

import { __, _x } from '@wordpress/i18n';

const view = ( { attributes, className, isEditView } ) => {
	// Expected values in save.
	let days = '&nbsp;';
	let hours = '&nbsp;';
	let mins = '&nbsp;';
	let secs = '&nbsp;';
	if ( isEditView ) {
		// Zero out.
		days = hours = mins = secs = 0;
		let eventTime;
		if ( attributes.eventTimestamp ) {
			eventTime = attributes.eventTimestamp * 1000;
		} else {
			// backwards compatibility
			eventTime = new Date( attributes.eventDate ).getTime();
		}
		const now = Date.now();
		const diff = eventTime - now;

		if ( diff > 0 ) {
			// Convert diff to seconds.
			let rem = Math.round( diff / 1000 );

			days = Math.floor( rem / ( 24 * 60 * 60 ) );
			rem = rem - days * 24 * 60 * 60;

			hours = Math.floor( rem / ( 60 * 60 ) );
			rem = rem - hours * 60 * 60;

			mins = Math.floor( rem / 60 );
			rem = rem - mins * 60;

			secs = rem;
		}
	}

	return (
		<div className={ className }>
			<div className="event-countdown__date">
				{ attributes.eventTimestamp || attributes.eventDate }
			</div>
			<div className="event-countdown__counter">
				<p>
					<strong className="event-countdown__day">{ days }</strong>{ ' ' }
					{ _x( 'days', 'Countdown days remaining', 'full-site-editing' ) }
				</p>
				<p>
					<span>
						<strong className="event-countdown__hour">{ hours }</strong>{ ' ' }
						{ _x( 'hours', 'Countdown hours remaining', 'full-site-editing' ) }
					</span>
					<span>
						<strong className="event-countdown__minute">{ mins }</strong>{ ' ' }
						{ _x( 'minutes', 'Countdown minutes remaining', 'full-site-editing' ) }
					</span>
					<span>
						<strong className="event-countdown__second">{ secs }</strong>{ ' ' }
						{ _x( 'seconds', 'Countdown seconds remaining', 'full-site-editing' ) }
					</span>
				</p>
				<p>{ __( 'until', 'full-site-editing' ) }</p>
			</div>
			<div className="event-countdown__event-title">
				<p>{ attributes.eventTitle }</p>
			</div>
		</div>
	);
};

export default view;
