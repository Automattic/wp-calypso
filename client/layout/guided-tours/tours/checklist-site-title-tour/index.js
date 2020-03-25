/**
 * External dependencies
 */

import React, { Fragment } from 'react';
import Gridicon from 'components/gridicon';

/**
 * Internal dependencies
 */
import meta from './meta';
import {
	ButtonRow,
	Continue,
	makeTour,
	Next,
	SiteLink,
	Step,
	Tour,
} from 'layout/guided-tours/config-elements';
import { SiteTitleButton } from 'layout/guided-tours/button-labels';

/* eslint-disable wpcalypso/jsx-classname-namespace */
export const ChecklistSiteTitleTour = makeTour(
	<Tour { ...meta }>
		<Step
			name="init"
			target="site-title-input"
			arrow="top-left"
			placement="below"
			style={ {
				animationDelay: '0.7s',
			} }
		>
			{ ( { translate } ) => (
				<Fragment>
					<p>
						{ translate(
							'Update the {{siteTitleButton/}} field with a descriptive name ' +
								'to let your visitors know which site they’re visiting.',
							{
								components: { siteTitleButton: <SiteTitleButton /> },
							}
						) }
					</p>
					<ButtonRow>
						<Continue target="settings-site-profile-save" step="finish" click hidden />
						<Next step="click-save">{ translate( 'All done, continue' ) }</Next>
						<SiteLink href="/home/:site">{ translate( 'Return to My Home' ) }</SiteLink>
					</ButtonRow>
				</Fragment>
			) }
		</Step>

		<Step name="click-save" target="settings-site-profile-save" arrow="top-right" placement="below">
			{ ( { translate } ) => (
				<Fragment>
					<Continue target="settings-site-profile-save" step="finish" click>
						{ translate(
							'Almost done — every time you make a change, it needs to be saved. ' +
								'Let’s save your changes and then see what’s next on our list.'
						) }
					</Continue>
				</Fragment>
			) }
		</Step>

		<Step name="finish" placement="right">
			{ ( { translate } ) => (
				<Fragment>
					<h1 className="tours__title">
						<span className="tours__completed-icon-wrapper">
							<Gridicon icon="checkmark" className="tours__completed-icon" />
						</span>
						{ translate( 'Good job, looks great!' ) }
					</h1>
					<p>
						{ translate(
							'Your changes have been saved. Let’s move on and see what’s next on our checklist.'
						) }
					</p>
					<SiteLink isButton href="/home/:site">
						{ translate( 'Return to My Home' ) }
					</SiteLink>
				</Fragment>
			) }
		</Step>
	</Tour>
);
