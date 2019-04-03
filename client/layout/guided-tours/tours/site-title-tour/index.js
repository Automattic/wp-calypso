/** @format */

/**
 * External dependencies
 */

import React, { Fragment } from 'react';

/**
 * Internal dependencies
 */
import meta from './meta';
import {
	ButtonRow,
	Continue,
	Link,
	makeTour,
	Next,
	Quit,
	Step,
	Tour,
} from 'layout/guided-tours/config-elements';
import { SettingsButton } from '../button-labels';

export const SiteTitleTour = makeTour(
	<Tour
		{...meta}
	>
		<Step name="init" placement="right" next="click-settings" style={ { animationDelay: '2s' } }>
			{ ( { translate } ) => (
				<Fragment>
					<p>
						{ translate(
							"Hey there! We noticed you haven't changed the title of your site yet. Want to change it?"
						) }
					</p>
					<p>
						{ translate(
							'The site title appears in places like the top of your web browser and in search results.'
						) }
					</p>
					<ButtonRow>
						<Next step="click-settings">{ translate( 'Yes, please!' ) }</Next>
						<Quit>{ translate( 'No, thanks.' ) }</Quit>
					</ButtonRow>
				</Fragment>
			) }
		</Step>

		<Step
			name="click-settings"
			target="settings"
			arrow="left-top"
			placement="beside"
			scrollContainer=".sidebar__region"
			shouldScrollTo
		>
			{ ( { translate } ) => (
				<Fragment>
					<Continue target="settings" step="site-title-input" click>
						{ translate( 'Click {{settingsButton/}} to continue.', {
							components: {
								settingsButton: <SettingsButton />,
							},
						} ) }
					</Continue>
				</Fragment>
			) }
		</Step>

		<Step name="site-title-input" target="site-title-input" arrow="top-left" placement="below">
			{ ( { translate } ) => (
				<Fragment>
					<p>
						{ translate(
							'You can change the site title here. A good title can help others find your site.'
						) }
					</p>
					<ButtonRow>
						<Next step="site-tagline-input">{ translate( 'Looks Good!' ) }</Next>
						<Quit>{ translate( 'Cancel' ) }</Quit>
					</ButtonRow>
				</Fragment>
			) }
		</Step>

		<Step name="site-tagline-input" target="site-tagline-input" arrow="top-left" placement="below">
			{ ( { translate } ) => (
				<Fragment>
					<p>
						{ translate(
							"While you're at it, why not add a tagline? It should explain what your site is about in a few words. " +
								'It usually appears right below your site title.'
						) }
					</p>
					<ButtonRow>
						<Next step="click-save">{ translate( 'Great!' ) }</Next>
						<Quit>{ translate( 'Cancel' ) }</Quit>
					</ButtonRow>
				</Fragment>
			) }
		</Step>

		<Step name="click-save" target="settings-site-profile-save" arrow="top-right" placement="below">
			{ ( { translate } ) => (
				<Fragment>
					<Continue target="settings-site-profile-save" step="finish" click>
						{ translate( "Don't forget to save your changes." ) }
					</Continue>
				</Fragment>
			) }
		</Step>

		<Step name="finish" placement="center">
			{ ( { translate } ) => (
				<Fragment>
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
					<Link href="https://en.support.wordpress.com/start">
						{ translate( 'Learn more about WordPress.com' ) }
					</Link>
				</Fragment>
			) }
		</Step>
	</Tour>
);
