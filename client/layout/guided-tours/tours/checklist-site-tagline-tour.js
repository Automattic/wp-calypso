/** @format */

/**
 * External dependencies
 */

import React from 'react';
import { translate } from 'i18n-calypso';
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

export const ChecklistSiteTaglineTour = makeTour(
	<Tour name="checklistSiteTagline" version="20171205" path="/non-existent-route" when={ noop }>
		<Step
			name="init"
			target="site-tagline-input"
			arrow="top-left"
			placement="below"
			style={ {
				animationDelay: '0.7s',
			} }
		>
			<p>
				{ translate(
					'First impressions last - a tagline tells visitors what your site is all about without ' +
						'having to read all your content. Enter a short descriptive phrase about your site into ' +
						'the {{b}}Site Tagline{{/b}} field.',
					{ components: { b: <strong /> } }
				) }
			</p>
			<ButtonRow>
				<Continue target="settings-site-profile-save" step="finish" click hidden />
				<Next step="click-save">{ translate( 'All done, continue' ) }</Next>
				<SiteLink href="/checklist/:site">{ translate( 'Return to the checklist' ) }</SiteLink>
			</ButtonRow>
		</Step>

		<Step name="click-save" target="settings-site-profile-save" arrow="top-left" placement="below">
			<Continue target="settings-site-profile-save" step="finish" click>
				{ translate(
					'Almost done — press {{b}}Save Settings{{/b}} to save your changes and then see what’s next on our list.',
					{ components: { b: <strong /> } }
				) }
			</Continue>
		</Step>

		<Step name="finish" placement="right">
			<h1 className="tours__title">
				<span className="tours__completed-icon-wrapper">
					<Gridicon icon="checkmark" className="tours__completed-icon" />
				</span>
				{ translate( 'Way to go!' ) }
			</h1>
			<p>
				{ translate(
					'Your tagline has been saved! Let’s move on and see what’s next on our checklist.'
				) }
			</p>
			<SiteLink isButton href={ '/checklist/:site' }>
				{ translate( 'Return to the checklist' ) }
			</SiteLink>
		</Step>
	</Tour>
);
