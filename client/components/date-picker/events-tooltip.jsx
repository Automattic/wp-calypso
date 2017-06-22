/**
 * External Dependencies
 */
import React, { PropTypes, Component } from 'react';
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
		maxEventsPerTooltip: PropTypes.number,
	};

	static defaultProps = {
		maxEventsPerTooltip: 8,
	};

	render() {
		const { events, maxEventsPerTooltip, isVisible } = this.props;

		const label = this.props.translate(
			'%d post',
			'%d posts', {
				count: events.length,
				args: events.length,
			}
		);

		const show = !! ( events && events.length && isVisible );
		const moreEvents = events.length - maxEventsPerTooltip;

		return (
			<Tooltip
				className="date-picker__events-tooltip"
				context={ this.props.context }
				isVisible={ show }
				onClose={ noop }
			>
				<span>{ label }</span>
				<hr className="date-picker__division" />
				<ul>
					{ map( events, ( event, i ) => ( i < maxEventsPerTooltip ) &&
						<li key={ event.id }>
							<CalendarEvent
								icon={ event.icon }
								socialIcon={ event.socialIcon }
								socialIconColor={ event.socialIconColor }
								title={ event.title } />
						</li>
					) }

					{ ( moreEvents > 0 ) &&
						<li>
							{ this.props.translate(
								'… and %(moreEvents)d more post',
								'… and %(moreEvents)d more posts', {
									count: moreEvents,
									args: {
										moreEvents
									}
								}
							) }
						</li>
					}
				</ul>
			</Tooltip>
		);
	}
}

export default localize( EventsTooltip );

