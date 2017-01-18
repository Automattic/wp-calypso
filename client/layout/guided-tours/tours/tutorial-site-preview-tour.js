/**
 * External dependencies
 */
import React from 'react';
import { translate } from 'i18n-calypso';
import {
	overEvery as and,
} from 'lodash';
import Gridicon from 'gridicons';

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
import {
	isNewUser,
	isEnabled,
	isSelectedSitePreviewable,
} from 'state/ui/guided-tours/contexts';
import { isPreviewShowing } from 'state/ui/selectors';

export const TutorialSitePreviewTour = makeTour(
	<Tour
		name="tutorialSitePreview"
		version="20170101"
		path="/stats"
		when={ and(
			isEnabled( 'guided-tours/tutorial-site-preview' ),
			isNewUser,
		) }
	>
		<Step name="init"
			target="site-card-preview"
			arrow="top-left"
			placement="below"
			when={ isSelectedSitePreviewable }
			scrollContainer=".sidebar__region"
		>
			<p>
				{
					translate( "This shows your currently {{strong}}selected site{{/strong}}'s name and address.", {
						components: {
							strong: <strong />,
						}
					} )
				}
			</p>
			<Continue click step="close-preview" target="site-card-preview">
				{
					translate( "Click {{strong}}your site's name{{/strong}} to continue.", {
						components: {
							strong: <strong />,
						},
					} )
				}
			</Continue>
			<ButtonRow>
				<Quit subtle>{ translate( 'No, thanks.' ) }</Quit>
			</ButtonRow>
		</Step>

		<Step name="close-preview"
			placement="center"
			when={ and( isSelectedSitePreviewable, isPreviewShowing ) }
		>
			<p>
				{ translate( "Take a look around — and when you're done, close the site preview using the {{icon/}}. " +
					'You can come back here anytime.', {
						components: { icon: <Gridicon icon="cross" /> }
					}
				) }
			</p>
			<ButtonRow>
				<Quit primary>
					{ translate( 'Got it.' ) }
				</Quit>
			</ButtonRow>
		</Step>
	</Tour>
);
