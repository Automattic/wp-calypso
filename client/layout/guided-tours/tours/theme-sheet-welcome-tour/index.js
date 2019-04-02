/** @format */

/**
 * External dependencies
 */

import React, { Fragment } from 'react';
import { not } from 'layout/guided-tours/utils';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import meta from './meta';
import {
	ButtonRow,
	Continue,
	Next,
	Quit,
	Step,
	Tour,
	makeTour,
} from 'layout/guided-tours/config-elements';
import { isPreviewShowing } from 'state/ui/selectors';
import { AllThemesButton } from '../button-labels';

export const ThemeSheetWelcomeTour = makeTour(
	<Tour { ...meta }>
		<Step name="init" placement="right" next="live-preview" style={ { animationDelay: '2s' } }>
			{ ( { translate } ) => (
				<Fragment>
					<p>
						{ translate(
							'This page shows all the details about a specific theme. ' +
								'Ready for a little tour?'
						) }
					</p>
					<ButtonRow>
						<Next step="live-preview">{ translate( "Let's go!" ) }</Next>
						<Quit>{ translate( 'No, thanks.' ) }</Quit>
					</ButtonRow>
				</Fragment>
			) }
		</Step>

		<Step
			name="live-preview"
			target="theme-sheet-preview"
			placement="below"
			arrow="top-left"
			next="close-preview"
		>
			{ ( { translate } ) => (
				<Fragment>
					<p>{ translate( 'Nothing beats seeing a theme in action. Try the live demo!' ) }</p>
					<ButtonRow>
						<Continue icon="themes" step="close-preview" target="theme-sheet-preview" click />
					</ButtonRow>
				</Fragment>
			) }
		</Step>

		<Step
			name="close-preview"
			target=".web-preview.is-visible [data-tip-target='web-preview__close']"
			placement="beside"
			arrow="left-top"
			when={ isPreviewShowing }
		>
			{ ( { translate } ) => (
				<Fragment>
					<p>
						{ translate(
							"This is what this theme looks like in action. Move around, click on things. Do you like what you're seeing?"
						) }
					</p>
					<ButtonRow>
						<Continue when={ not( isPreviewShowing ) } step="theme-docs">
							{ translate( 'Tap {{icon/}} to close the live demo.', {
								components: { icon: <Gridicon icon="cross" /> },
							} ) }
						</Continue>
					</ButtonRow>
				</Fragment>
			) }
		</Step>

		<Step
			name="theme-docs"
			target=".theme__sheet-content .section-nav-tab:last-child"
			placement="beside"
			arrow="left-top"
		>
			{ ( { translate } ) => (
				<Fragment>
					<p>
						{ translate(
							'Each theme comes with a range of powerful features. ' +
								'Learn more about unlocking its full potential and setting it up on your site.'
						) }
					</p>
					<ButtonRow>
						<Next step="pick-activate-wide" />
					</ButtonRow>
				</Fragment>
			) }
		</Step>

		<Step
			name="pick-activate-wide"
			target=".theme__sheet-primary-button"
			arrow="top-left"
			placement="below"
			next="back-to-list"
		>
			{ ( { translate } ) => (
				<Fragment>
					<p>
						{ translate(
							'Is this the right theme for you? This button would pick the design for your site.'
						) }
					</p>
					<ButtonRow>
						<Next step="back-to-list">{ translate( 'Maybe later' ) }</Next>
					</ButtonRow>
					<Continue step="back-to-list" target=".theme__sheet-primary-button" click hidden />
				</Fragment>
			) }
		</Step>

		<Step
			name="back-to-list"
			target=".theme__sheet-action-bar .header-cake__back.button"
			placement="beside"
			arrow="left-top"
			style={ { marginTop: '-15px', zIndex: 1 } }
		>
			{ ( { translate } ) => (
				<Fragment>
					<p>
						{ translate(
							"That's it! " +
								'You can click on {{allThemesButton/}} at any time to return to our design showcase.',
							{
								components: { allThemesButton: <AllThemesButton /> },
							}
						) }
					</p>
					<ButtonRow>
						<Quit primary>{ translate( 'Done' ) }</Quit>
					</ButtonRow>
				</Fragment>
			) }
		</Step>
	</Tour>
);
