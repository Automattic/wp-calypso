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
	Next,
	Quit,
	// Link,
	Continue,
} from 'layout/guided-tours/config-elements';
import {
	isNewSite,
	// isNewUser,
	// isEnabled,
	// isSelectedSitePreviewable,
} from 'state/ui/guided-tours/contexts';
// import { isPreviewShowing } from 'state/ui/selectors';
import { isDesktop } from 'lib/viewport';

export const SeeFollowersTour = makeTour(
	<Tour
		name="seeFollowersTour"
		version="20170323"
		path="/stats"
		when={ and(
			isNewSite,
			isDesktop
			) }>
		<Step
			name="init"
			placement="right">
			<p>
				{ translate( "Interested in viewing your followers?"
				)}
			</p>
			<ButtonRow>
				<Next step="click-people">Sure, show me!</Next>
				<Quit>No, thanks</Quit>
			</ButtonRow>
		</Step>
		<Step
			name="click-people"
			placement="beside"
			arrow="left-top" 
			target=".users"
			scrollContainer=".sidebar__region"
			shouldScrollTo>
				<Continue
					target=".users" 
					step="people"click>
					{ translate( "Click {{strong}}{{icon/}} People{{/strong}} to continue.", {
							components: {
								icon: <Gridicon icon="user" />,
								strong: <strong />
							}
						})
					}
				</Continue>
		</Step>
		<Step
			name="people"
			placement="right">
		<p>
			{ translate( "See who subscribed by going to {{strong}}Followers{{/strong}} and {{strong}}Email Followers{{/strong}}.", {
						components: {
							strong: <strong />
							}
				})
			}
		</p>
		<ButtonRow>
				<Quit>Ok, got it!</Quit>
			</ButtonRow>
		</Step>
	</Tour>
);