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
	ButtonRow,
	Continue,
	makeTour,
	Next,
	Quit,
	Step,
	Tour,
} from 'layout/guided-tours/config-elements';
import { canUserEditSettingsOfSelectedSite } from 'state/ui/guided-tours/contexts';

export const SiteTitleTour = makeTour(
	<Tour
		name="siteTitle"
		version="20171205"
		path="/stats"
		when={ and( canUserEditSettingsOfSelectedSite ) }
	>
		<Step name="init" target="site-title-input" arrow="top-left" placement="below">
			<p>
				{ translate(
					'You can change the site title here. A good title can help others find your site.'
				) }
			</p>
			<ButtonRow>
				<Next step="click-save">{ translate( 'Looks Good!' ) }</Next>
				<Quit>{ translate( 'Cancel' ) }</Quit>
			</ButtonRow>
		</Step>

		<Step name="click-save" target="settings-site-profile-save" arrow="top-right" placement="below">
			<Continue target="settings-site-profile-save" step="finish" click>
				{ translate( "Don't forget to save your changes." ) }
			</Continue>
		</Step>

		<Step name="finish" placement="center">
			<p>
				{ translate(
					"{{strong}}That's it!{{/strong}} Your visitors can now easily identify your website by its title.",
					{
						components: {
							strong: <strong />,
						},
					}
				) }
			</p>
			<ButtonRow>
				<Quit primary>{ translate( "We're all done!" ) }</Quit>
			</ButtonRow>
		</Step>
	</Tour>
);
