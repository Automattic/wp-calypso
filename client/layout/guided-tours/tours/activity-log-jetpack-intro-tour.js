/** @format */

/**
 * External dependencies
 */

import React, { Fragment } from 'react';
import { overEvery as and } from 'lodash';

/**
 * Internal dependencies
 */
import { makeTour, Tour, Step, ButtonRow, Quit } from 'layout/guided-tours/config-elements';
import { isSelectedSiteJetpack, isSelectedSitePlanFree } from 'state/ui/guided-tours/contexts';

export const ActivityLogJetpackIntroTour = makeTour(
	<Tour
		name="activityLogJetpackIntroTour"
		version="20180808"
		path="/stats/activity/"
		when={ and( isSelectedSiteJetpack, isSelectedSitePlanFree ) }
	>
		<Step name="init" arrow="top-left" target=".stats-navigation__activity" placement="below">
			{ ( { translate } ) => (
				<Fragment>
					<p>
						{ translate(
							"Stay informed of all your site's activity ranging from plugin and theme updates " +
								'to user logins and settings modifications. {{a}}Learn more{{/a}}',
							{ components: { a: <a href="https://jetpack.com/support/activity-log/" /> } }
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
