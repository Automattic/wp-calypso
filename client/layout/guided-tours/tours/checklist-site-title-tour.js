/** @format */

/**
 * External dependencies
 */

import React, { Fragment } from 'react';
import { noop } from 'lodash';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import {
	ButtonRow,
	Continue,
	makeTour,
	Next,
	SiteLink,
	Step,
	Tour,
} from 'layout/guided-tours/config-elements';
import { SiteTitleButton } from '../button-labels';

export const ChecklistSiteTitleTour = makeTour(
	<Tour name="checklistSiteTitle" version="20171205" path="/non-existent-route" when={ noop }>
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
						<SiteLink href="/checklist/:site">{ translate( 'Return to the checklist' ) }</SiteLink>
					</ButtonRow>
				</Fragment>
			) }
		</Step>

		<Step name="click-save" target="settings-site-profile-save" arrow="top-left" placement="below">
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
					<SiteLink isButton href={ '/checklist/:site' }>
						{ translate( 'Return to the checklist' ) }
					</SiteLink>
				</Fragment>
			) }
		</Step>
	</Tour>
);
