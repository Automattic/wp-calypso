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
	Continue,
	Next,
	Quit,
	Step,
	Tour,
	makeTour,
} from 'layout/guided-tours/config-elements';
import {
	inSection,
	isEnabled,
	isNewUser,
	previewIsShowing,
} from 'state/ui/guided-tours/contexts';
import { isDesktop } from 'lib/viewport';

export const ThemeSheetTour = makeTour(
	<Tour name="theme" version="20160812" path="/theme" when={ and( isNewUser, isEnabled( 'guided-tours/theme', isDesktop ) ) }>
		<Step name="init" placement="right" next="live-preview" className="guided-tours__step-first">
			<p className="guided-tours__step-text">
				{ 'This page shows all the details about a specific theme design. May I show you around?' }
			</p>
			<div className="guided-tours__choice-button-row">
				<Next step="live-preview">{ translate( "Let's go!" ) }</Next>
				<Quit>{ translate( 'No thanks.' ) }</Quit>
			</div>
		</Step>

		<Step name="live-preview"
			target="theme-sheet-preview"
			placement="below"
			arrow="top-left"
			next="close-preview"
		>
			<p className="guided-tours__step-text">
				{ 'Here you can see the design in action in a demo site.' }
			</p>
			<p className="guided-tours__actionstep-instructions">
				<Continue step="close-preview" target="theme-sheet-preview" click />
			</p>
		</Step>

		<Step name="close-preview"
			target=".web-preview.is-visible [data-tip-target='web-preview__close']"
			arrow="left-top"
			placement="beside"
			when={ previewIsShowing }
			next="pick-activate"
		>
			<p className="guided-tours__step-text">
				{ 'This is the live demo. Take a look around, see if the design suits you! Then tap here to close.' }
			</p>
			<p className="guided-tours__actionstep-instructions">
				<Continue when={ not( previewIsShowing ) } step="pick-activate" />
			</p>
		</Step>

		<Step name="pick-activate"
			target=".theme__sheet-primary-button"
			arrow="top-left"
			placement="below"
			next="back-to-list"
		>
			<p className="guided-tours__step-text">
				{ 'This will activate the design you’re currently seeing on your site.' }
			</p>
			<div className="guided-tours__choice-button-row">
				<Next step="back-to-list" />
				<Quit />
			</div>
		</Step>

		<Step name="back-to-list"
			target=".theme__sheet-action-bar .header-cake__back.button"
			placement="beside"
			arrow="left-top"
			when={ inSection( 'theme' ) }
		>
			<p className="guided-tours__step-text">
				{ 'You can go back to the themes list here.' }
			</p>
		</Step>
	</Tour>
);
