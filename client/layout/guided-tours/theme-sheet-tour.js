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
	isEnabled,
	isNewUser,
	previewIsShowing,
} from 'state/ui/guided-tours/contexts';
import { isDesktop, isMobile } from 'lib/viewport';

const PickActivateStep = () => (
	<p>
		{ translate(
			'This will activate the design you’re currently seeing on your site.'
		) }
	</p>
);

export const ThemeSheetTour = makeTour(
	<Tour name="theme"
		version="20161129"
		path="/theme"
		when={ and(
			isEnabled( 'guided-tours/theme' ),
			isNewUser,
			not( isMobile )
			) }
	>
		<Step name="init" placement="right" next="live-preview">
			<p>
				{ translate(
					'This page shows all the details about a specific theme ' +
					'design. May I show you around?'
				) }
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
				{ translate( 'Here you can see the design in action in a demo site.' ) }
			</p>
			<ButtonRow>
				<Continue step="close-preview" target="theme-sheet-preview" click />
			</ButtonRow>
		</Step>

		<Step name="close-preview"
			target=".web-preview.is-visible [data-tip-target='web-preview__close']"
			placement="beside"
			arrow="left-top"
			when={ previewIsShowing }
		>
			<p>
				{ translate(
					'This is the live demo. Take a look around, see if the design suits you! Then close the preview to return.'
				) }
			</p>
			<ButtonRow>
				<Continue when={ not( previewIsShowing ) } step="theme-docs" icon="cross" />
			</ButtonRow>
		</Step>

		<Step name="theme-docs"
			target=".theme__sheet-content .section-nav-tab:last-child"
			placement="beside"
			arrow="left-top"
		>
			<p>
				{ translate(
					'There\'s more to your theme than meets the eye! Unlock its ' +
					'full potential, discover its features — everything is ' +
					'in the documentation.'
				) }
			</p>
			<ButtonRow>
				<Next step="pick-activate-wide" />
			</ButtonRow>
		</Step>

		<Step name="pick-activate-wide"
			target=".theme__sheet-primary-button"
			arrow="top-left"
			placement="below"
			when={ isDesktop }
			next="pick-activate-narrow"
		>
			<PickActivateStep />
			<ButtonRow>
				<Next step="pick-activate-narrow">{ translate( 'Got it' ) }</Next>
				<Continue step="pick-activate-narrow" target=".theme__sheet-primary-button" click hidden />
				<Quit />
			</ButtonRow>
		</Step>

		<Step name="pick-activate-narrow"
			target=".theme__sheet-primary-button"
			arrow="top-right"
			placement="below"
			next="back-to-list"
			when={ not( isDesktop ) }
		>
			<PickActivateStep />
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
				{ translate(
					'That\'s it! You can return to our design showcase anytime through here.'
				) }
			</p>
			<ButtonRow>
				<Quit primary>{ translate( 'Done' ) }</Quit>
			</ButtonRow>
		</Step>
	</Tour>
);
