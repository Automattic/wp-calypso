/**
 * External dependencies
 */

import React, { Fragment } from 'react';

/**
 * Internal dependencies
 */
import meta from './meta';
import ActivityLogDocumentationLink from 'my-sites/activity/activity-log/activity-log-documentation-link';
import { makeTour, Tour, Step, ButtonRow, Quit } from 'layout/guided-tours/config-elements';

export const ActivityLogWpcomIntroTour = makeTour(
	<Tour { ...meta }>
		<Step
			name="init"
			arrow="top-left"
			target="activity"
			placement="below"
			scrollContainer=".sidebar__region"
		>
			{ ( { translate } ) => (
				<Fragment>
					<p>
						{ translate(
							"Keep tabs on all your site's activity — new posts, pages, and comments, " +
								'setting modifications, and more. {{DocumentationLink/}}',
							{
								components: {
									DocumentationLink: (
										<ActivityLogDocumentationLink
											url="https://en.support.wordpress.com/activity-log/"
											source="activityLogWpcomIntroTour"
										/>
									),
								},
							}
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
