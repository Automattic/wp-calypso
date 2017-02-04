/**
 * External dependencies
 */
import React from 'react';
import { translate } from 'i18n-calypso';
import { overEvery as and } from 'lodash';

/**
 * Internal dependencies
 */
import {
	ButtonRow,
	LinkQuit,
	makeTour,
	Quit,
	Step,
	Tour,
} from 'layout/guided-tours/config-elements';
import {
	isAbTestInVariant,
	isEnabled,
	isSelectedSitePlanPaid,
} from 'state/ui/guided-tours/contexts';
import { isDesktop } from 'lib/viewport';

export const BoostedPostTour = makeTour(
	<Tour
		name="boostedPostSurvey"
		path="/posts/"
		version="20170127"
		when={ and(
			isEnabled( 'boosted-post-survey' ),
			isDesktop,
			isSelectedSitePlanPaid,
			isAbTestInVariant( 'boostedPostSurvey', 'enabled' ),
		) }
	>
		<Step name="init" placement="right">
			<p>
				{
					translate(
						'{{strong}}Want to reach a bigger audience?{{/strong}} ' +
							'Take our survey and help shape a new feature.',
						{
							components: {
								strong: <strong />,
							}
						}
					)
				}
			</p>
			<ButtonRow>
				<LinkQuit
					primary
					target="_blank"
					href="https://jonburke.polldaddy.com/s/boosted-post">
					{ translate( 'Learn more' ) }
				</LinkQuit>
				<Quit>{ translate( 'No, thanks.' ) }</Quit>
			</ButtonRow>
		</Step>
	</Tour>
);
