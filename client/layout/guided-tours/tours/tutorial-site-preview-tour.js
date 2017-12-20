/** @format */

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
	makeTour,
	Tour,
	Step,
	ButtonRow,
	Quit,
	Continue,
} from 'layout/guided-tours/config-elements';
import { isNewUser, isEnabled, isSelectedSitePreviewable } from 'state/ui/guided-tours/contexts';

const ViewSiteButtonLabel = translate( 'View Site' );

export const TutorialSitePreviewTour = makeTour(
	<Tour
		name="tutorialSitePreview"
		version="20170101"
		path="/stats"
		when={ and(
			isEnabled( 'guided-tours/tutorial-site-preview' ),
			isSelectedSitePreviewable,
			isNewUser
		) }
	>
		<Step
			name="init"
			target="sitePreview"
			arrow="top-left"
			placement="below"
			scrollContainer=".sidebar__region"
		>
			<p>
				{ translate(
					'{{ViewSiteButton/}} shows you what your site looks like to visitors. Click it to continue.',
					{
						components: {
							ViewSiteButton: <strong>{ ViewSiteButtonLabel }</strong>,
						},
					}
				) }
			</p>
			<Continue hidden click step="finish" target="sitePreview" />
			<ButtonRow>
				<Quit subtle>{ translate( 'No, thanks.' ) }</Quit>
			</ButtonRow>
		</Step>

		<Step name="finish" placement="center">
			<p>
				{ translate(
					"Take a look around — and when you're done, explore the rest of WordPress.com."
				) }
			</p>
			<ButtonRow>
				<Quit primary>{ translate( 'Got it.' ) }</Quit>
			</ButtonRow>
		</Step>
	</Tour>
);
