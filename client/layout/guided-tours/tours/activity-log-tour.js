/** @format */

/**
 * External dependencies
 */

import React, { Fragment } from 'react';
import { overEvery as and } from 'lodash';

/**
 * Internal dependencies
 */
import {
	makeTour,
	Tour,
	Step,
	ButtonRow,
	Next,
	Quit,
	Continue,
} from 'layout/guided-tours/config-elements';
import { isNotNewUser } from 'state/ui/guided-tours/contexts';
import { isDesktop } from 'lib/viewport';

export const ActivityLogTour = makeTour(
	<Tour
		name="activityLogTour"
		version="20171025"
		path={ [ '/stats/activity/' ] }
		when={ and( isDesktop, isNotNewUser ) }
	>
		<Step name="init" style={ { animationDelay: '5s' } }>
			{ ( { translate } ) => (
				<Fragment>
					<p>
						{ translate(
							'{{strong}}Need a hand?{{/strong}} ' +
								"We'd love to show you around the Activity Log, " +
								'and tell you how you can use it to restore a previous state of your site.',
							{ components: { strong: <strong /> } }
						) }
					</p>
					<ButtonRow>
						<Next step="rewind">{ translate( "Let's go!" ) }</Next>
						<Quit>{ translate( 'No, thanks.' ) }</Quit>
					</ButtonRow>
				</Fragment>
			) }
		</Step>
		<Step
			name="rewind"
			arrow="top-left"
			target=".has-expanded-summary .activity-log-day__day"
			placement="below"
		>
			{ ( { translate } ) => (
				<Fragment>
					<p>
						{ translate(
							'Each block collects all the activities performed on your site ' +
								'like publishing a post or updating a plugin. ' +
								'To restore your site to a particular day, click its rewind button.'
						) }
					</p>
					<ButtonRow>
						<Next step="expand" />
						<Quit>{ translate( 'Do this later.' ) }</Quit>
					</ButtonRow>
				</Fragment>
			) }
		</Step>
		<Step name="expand" arrow="top-left" target=".has-expanded-summary" placement="below">
			{ ( { translate } ) => (
				<Fragment>
					<p>
						{ translate(
							'You can click on each block to show more details. ' +
								'When expanded, it will display every event that happened on that day.'
						) }
					</p>
					<ButtonRow>
						<Continue click step="events" target=".activity-log-day:not(.is-empty)">
							{ translate( 'Click on the block to expand it and continue.' ) }
						</Continue>
					</ButtonRow>
				</Fragment>
			) }
		</Step>
		<Step name="events" arrow="top-left" target=".activity-log-item__card" placement="below">
			{ ( { translate } ) => (
				<Fragment>
					<p>
						{ translate(
							'Each of these events represent an action that took place in your site.'
						) }
					</p>
					<ButtonRow>
						<Next step="actions" />
						<Quit>{ translate( 'Do this later.' ) }</Quit>
					</ButtonRow>
				</Fragment>
			) }
		</Step>
		<Step
			name="actions"
			arrow="top-right"
			target={
				'.has-expanded-summary .activity-log-item:not(.is-discarded) ' +
				'.foldable-card__secondary .foldable-card__summary-expanded .ellipsis-menu__toggle'
			}
			placement="below"
			style={ { marginLeft: '-18px' } }
		>
			{ ( { translate } ) => (
				<Fragment>
					<p>
						{ translate(
							"In here you'll find each event's options, such as rewinding one by one."
						) }
					</p>
					<ButtonRow>
						<Quit primary>{ translate( 'Got it, thanks!' ) }</Quit>
					</ButtonRow>
				</Fragment>
			) }
		</Step>
	</Tour>
);
