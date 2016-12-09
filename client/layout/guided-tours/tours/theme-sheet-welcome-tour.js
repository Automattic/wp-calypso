/**
 * External dependencies
 */
import React from 'react';
import { overEvery as and, negate as not } from 'lodash';
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import {
	ButtonRow,
	Continue,
	Next,
	Quit,
	Step,
	Tour,
	makeTour,
} from 'layout/guided-tours/config-elements';
import {
	isAbTestInVariant,
	isEnabled,
	isNewUser,
} from 'state/ui/guided-tours/contexts';
import { isPreviewShowing } from 'state/ui/selectors';
import { isDesktop } from 'lib/viewport';

export const ThemeSheetWelcomeTour = makeTour(
	<Tour name="themeSheetWelcomeTour"
		version="20161129"
		path="/theme"
		when={ and(
			isEnabled( 'guided-tours/theme-sheet-welcome' ),
			isNewUser,
			isDesktop,
			isAbTestInVariant( 'themeSheetWelcomeTour', 'enabled' )
		) }
	>
		<Step name="init" placement="right" next="live-preview">
			<p>
				{
					'This page shows all the details about a specific theme. ' +
					'May I show you around?'
				}
			</p>
			<ButtonRow>
				<Next step="live-preview">{ translate( "Let's go!" ) }</Next>
				<Quit>{ translate( 'No, thanks' ) }</Quit>
			</ButtonRow>
		</Step>

		<Step name="live-preview"
			target="theme-sheet-preview"
			placement="below"
			arrow="top-left"
			next="close-preview"
		>
			<p>
				{ 'Here you can see the design in action in a demo site.' }
			</p>
			<ButtonRow>
				<Continue step="close-preview" target="theme-sheet-preview" click />
			</ButtonRow>
		</Step>

		<Step name="close-preview"
			target=".web-preview.is-visible [data-tip-target='web-preview__close']"
			placement="beside"
			arrow="left-top"
			when={ isPreviewShowing }
		>
			<p>
				{
					'This is the live demo. Take a look around, see if the design suits you! Then close the preview to return.'
				}
			</p>
			<ButtonRow>
				<Continue when={ not( isPreviewShowing ) } step="theme-docs" icon="cross" />
			</ButtonRow>
		</Step>

		<Step name="theme-docs"
			target=".theme__sheet-content .section-nav-tab:last-child"
			placement="beside"
			arrow="left-top"
		>
			<p>
				{
					'There\'s more to your theme than meets the eye! Unlock its ' +
					'full potential, discover its features — everything is ' +
					'in the documentation.'
				}
			</p>
			<ButtonRow>
				<Next step="pick-activate-wide" />
			</ButtonRow>
		</Step>

		<Step name="pick-activate-wide"
			target=".theme__sheet-primary-button"
			arrow="top-left"
			placement="below"
			next="back-to-list"
		>
			<p>
				{
					'This would activate the design you\'re currently seeing on your site.'
				}
			</p>
			<ButtonRow>
				<Next step="back-to-list">{ translate( 'Got it' ) }</Next>
				<Continue step="back-to-list" target=".theme__sheet-primary-button" click hidden />
				<Quit />
			</ButtonRow>
		</Step>

		<Step name="back-to-list"
			target=".theme__sheet-action-bar .header-cake__back.button"
			placement="beside"
			arrow="left-top"
			style={ { marginTop: '-15px', zIndex: 1 } }
		>
			<p>
				{
					'That\'s it! You can return to our design showcase anytime through here.'
				}
			</p>
			<ButtonRow>
				<Quit primary>{ translate( 'Done' ) }</Quit>
			</ButtonRow>
		</Step>
	</Tour>
);
