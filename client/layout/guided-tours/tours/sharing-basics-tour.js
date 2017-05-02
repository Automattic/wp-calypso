/**
 * External dependencies
 */
import React from 'react';
import { translate } from 'i18n-calypso';
import {
	overEvery as and,
} from 'lodash';

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
} from 'layout/guided-tours/config-elements';
import {
	isNewUser,
} from 'state/ui/guided-tours/contexts';
import { isDesktop } from 'lib/viewport';

export const SharingBasicsTour = makeTour(
	<Tour
		name="sharingBasicsTour"
		version="201703213"
		path="/sharing"
			when={ and(
			isDesktop,
			isNewUser,
			) }
		>
		<Step
			name="init"
			placement="center"
			style={ { animationDelay: '3s', } }
			>
			<p>
				Welcome to Publicize, a tool you can use to share your site to social media.
			</p>
			<ButtonRow>
				<Next step="connect-account">Continue</Next>
				<Quit>Quit</Quit>
			</ButtonRow>
		</Step>

		<Step
			name="connect-account"
			target=".sharing-services-group .sharing-service .button.is-primary"
			placement="beside"
			>
			<p>
			{
					translate( 'Click {{strong}}Connect{{/strong}} to share your posts with a service.',
						{
							components: {
								strong: <strong />,
							}
						} )
				}
			</p>
			<ButtonRow>
				<Quit primary>Got it, I'm ready to share!</Quit>
			</ButtonRow>
		</Step>

	</Tour>
);
