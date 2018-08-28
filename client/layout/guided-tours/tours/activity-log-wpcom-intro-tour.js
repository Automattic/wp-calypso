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
import { isSelectedSiteNotJetpack, isSelectedSitePlanFree } from 'state/ui/guided-tours/contexts';

export const ActivityLogWpcomIntroTour = makeTour(
	<Tour
		name="activityLogWpcomIntroTour"
		version="20180808"
		path="/stats/activity/"
		when={ and( isSelectedSiteNotJetpack, isSelectedSitePlanFree ) }
	>
		<Step
			name="init"
			arrow="top-left"
			target=".stats-navigation__activity"
			placement="below"
			scrollContainer=".section-nav__mobile-header"
		>
			{ ( { translate } ) => (
				<Fragment>
					<p>
						{ translate(
							"Keep tabs on all your site's activity — new posts, pages, and comments, " +
								'setting modifications, and more.'
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
