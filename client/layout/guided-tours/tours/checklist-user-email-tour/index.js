/** @format */

/**
 * External dependencies
 */

import React, { Fragment } from 'react';

/**
 * Internal dependencies
 */
import meta from './meta';
import { makeTour, Step, Tour } from 'layout/guided-tours/config-elements';

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
							'Make sure your email address is correct. ' +
								'If not, change it here then click on Save Account Settings button below.'
						) }
					</p>
				</Fragment>
			) }
		</Step>
	</Tour>
);
