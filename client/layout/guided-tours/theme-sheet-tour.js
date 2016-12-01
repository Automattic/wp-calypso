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
				<Continue step="try-viewport" target="theme-sheet-preview" click />
			</ButtonRow>
		</Step>

		<Step name="try-viewport"
			target=".web-preview.is-visible"
			placement="middle"
			when={ previewIsShowing }
		>
			<p>
				{ translate(
					'This is the live demo. You can also see what the design ' +
					'will look like on mobile devices by clicking on the phone ' +
					'or tablet icons in the toolbar.'
				) }
			</p>
			<ButtonRow>
				<Next step="close-preview" />
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
					'Take a look around, see if the design suits you! Then ' +
					'close the preview to return.'
				) }
			</p>
			<ButtonRow>
				<Continue when={ not( previewIsShowing ) } step="theme-docs" icon="cross" />
			</ButtonRow>
		</Step>

		<Step name="theme-docs"
			target=".theme__sheet-content p:nth-child(2)"
			placement="beside"
			arrow="left-top"
			scrollContainer="body"
			shouldScrollTo
		>
			<p>Here be docs. Here be docs. Here be docs. Here be docs. Here be docs. </p>
			<ButtonRow>
				<Next step="pick-activate" />
			</ButtonRow>
		</Step>

		<Step name="pick-activate"
			target=".theme__sheet-primary-button"
			arrow="top-left"
			placement="below"
			next="back-to-list"
			scrollContainer="body"
			shouldScrollTo
		>
			<p>
				{ translate(
					'This will activate the design you’re currently seeing on your site.'
				) }
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
