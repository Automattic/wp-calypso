/**
 * External dependencies
 */

import React, { Fragment } from 'react';

/**
 * Internal dependencies
 */
import meta from './meta';
import {
	makeTour,
	Tour,
	Step,
	ButtonRow,
	Quit,
	Continue,
} from 'calypso/layout/guided-tours/config-elements';
import { ViewSiteButton } from 'calypso/layout/guided-tours/button-labels';

export const TutorialSitePreviewTour = makeTour(
	<Tour { ...meta }>
		<Step
			name="init"
			target="sitePreview"
			arrow="top-left"
			placement="below"
			scrollContainer=".sidebar__region"
			style={ { animationDelay: '2s' } }
		>
			{ ( { translate } ) => (
				<Fragment>
					<p>
						{ translate(
							'{{viewSiteButton/}} shows you what your site looks like to visitors. Click it to continue.',
							{
								components: {
									viewSiteButton: <ViewSiteButton />,
								},
							}
						) }
					</p>
					<Continue hidden click step="finish" target="sitePreview" />
					<ButtonRow>
						<Quit subtle>{ translate( 'No, thanks.' ) }</Quit>
					</ButtonRow>
				</Fragment>
			) }
		</Step>

		<Step name="finish" placement="center">
			{ ( { translate } ) => (
				<Fragment>
					<p>
						{ translate(
							"Take a look around — and when you're done, explore the rest of WordPress.com."
						) }
					</p>
					<ButtonRow>
						<Quit primary>{ translate( 'Got it.' ) }</Quit>
					</ButtonRow>
				</Fragment>
			) }
		</Step>
	</Tour>
);
