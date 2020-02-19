/* eslint-disable wpcalypso/jsx-classname-namespace */
// disabled CSS class rule due to existing code already
// that users the non-conformant classnames

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */

const view = ( { attributes, className, isEditView } ) => {
	// Expected values in save.
	let days = '&nbsp;',
		hours = '&nbsp;',
		mins = '&nbsp;',
		secs = '&nbsp;';

	if ( isEditView ) {
		// Zero out.
		days = hours = mins = secs = 0;
		const eventTime = new Date( attributes.eventDate ).getTime();
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
			<div className="event-countdown__date">{ attributes.eventDate }</div>
			<div className="event-countdown__counter">
				<p>
					<strong className="event-countdown__day">{ days }</strong> { __( 'days' ) }
				</p>
				<p>
					<span>
						<strong className="event-countdown__hour">{ hours }</strong> { __( 'hours' ) }
					</span>
					<span>
						<strong className="event-countdown__minute">{ mins }</strong> { __( 'minutes' ) }
					</span>
					<span>
						<strong className="event-countdown__second">{ secs }</strong> { __( 'seconds' ) }
					</span>
				</p>
				<p>{ __( 'until' ) }</p>
			</div>
			<div className="event-countdown__event-title">
				<p>{ attributes.eventTitle }</p>
			</div>
		</div>
	);
};

export default view;
