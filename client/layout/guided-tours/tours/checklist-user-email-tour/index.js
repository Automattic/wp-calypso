/**
 * External dependencies
 */

import React, { Fragment } from 'react';

/**
 * Internal dependencies
 */
import meta from './meta';
import { ButtonRow, makeTour, SiteLink, Step, Tour } from 'layout/guided-tours/config-elements';

/* eslint-disable wpcalypso/jsx-classname-namespace */
export const ChecklistUserEmailTour = makeTour(
	<Tour { ...meta }>
		<Step
			name="init"
			target="#user_email"
			placement="below"
			arrow="top-left"
			style={ {
				animationDelay: '0.7s',
			} }
		>
			{ ( { translate } ) => (
				<Fragment>
					<p>
						{ translate(
							'Correct typos in your email address, then press {{b}}Save Account Settings{{/b}} to save your changes.',
							{
								components: { b: <strong /> },
							}
						) }
					</p>
					<ButtonRow>
						<SiteLink isButton={ true } href="/checklist/:site">
							{ translate( 'Return to the checklist' ) }
						</SiteLink>
					</ButtonRow>
				</Fragment>
			) }
		</Step>
	</Tour>
);
