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
import { SiteTaglineButton, SaveSettingsButton } from 'layout/guided-tours/button-labels';

/* eslint-disable wpcalypso/jsx-classname-namespace */
export const ChecklistSiteTaglineTour = makeTour(
	<Tour { ...meta }>
		<Step
			name="init"
			target="site-tagline-input"
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
							'First impressions last - a tagline tells visitors what your site is all about without ' +
								'having to read all your content. Enter a short descriptive phrase about your site into ' +
								'the {{siteTaglineButton/}} field.',
							{ components: { siteTaglineButton: <SiteTaglineButton /> } }
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

		<Step name="click-save" target="settings-site-profile-save" arrow="top-right" placement="below">
			{ ( { translate } ) => (
				<Fragment>
					<Continue target="settings-site-profile-save" step="finish" click>
						{ translate(
							'Almost done — press {{saveSettingsButton/}} to save your changes and then see what’s next on our list.',
							{ components: { saveSettingsButton: <SaveSettingsButton /> } }
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
						{ translate( 'Way to go!' ) }
					</h1>
					<p>
						{ translate(
							'Your tagline has been saved! Let’s move on and see what’s next on our checklist.'
						) }
					</p>
					<SiteLink isButton href="/checklist/:site">
						{ translate( 'Return to the checklist' ) }
					</SiteLink>
				</Fragment>
			) }
		</Step>
	</Tour>
);
