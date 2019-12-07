/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { noop, map } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Tooltip from 'components/tooltip';
import { CalendarEvent } from './event';

class EventsTooltip extends Component {
	static propTypes = {
		title: PropTypes.string,
		events: PropTypes.array,
		moment: PropTypes.func.isRequired,
		maxEvents: PropTypes.number,
		moreEvents: PropTypes.string,
	};

	static defaultProps = {
		events: [],
		maxEvents: 8,
	};

	render() {
		const { events, isVisible, maxEvents } = this.props;

		let title = this.props.title;
		if ( ! title ) {
			title = this.props.translate( '%d post', '%d posts', {
				count: events.length,
				args: events.length,
			} );
		}

		const show = !! ( events && events.length && isVisible );
		const moreEvents = events.length - maxEvents;

		let moreEventsLabel = this.props.moreEventsLabel;

		if ( ! moreEventsLabel ) {
			moreEventsLabel = this.props.translate(
				'… and %(moreEvents)d more post',
				'… and %(moreEvents)d more posts',
				{
					count: moreEvents,
					args: {
						moreEvents,
					},
				}
			);
		}

		return (
			<Tooltip
				className="date-picker__events-tooltip"
				context={ this.props.context }
				isVisible={ show }
				onClose={ noop }
			>
				<span>{ title }</span>
				<hr className="date-picker__division" />
				<ul>
					{ map(
						events,
						( event, i ) =>
							i < maxEvents && (
								<li key={ event.id }>
									<CalendarEvent
										icon={ event.icon }
										socialIcon={ event.socialIcon }
										socialIconColor={ event.socialIconColor }
										title={
											event.title === ''
												? this.props.translate( '{{em}}(No title){{/em}}', {
														components: { em: <em /> },
												  } )
												: event.title
										}
									/>
								</li>
							)
					) }

					{ moreEvents > 0 && <li>{ moreEventsLabel }</li> }
				</ul>
			</Tooltip>
		);
	}
}

export default localize( EventsTooltip );
