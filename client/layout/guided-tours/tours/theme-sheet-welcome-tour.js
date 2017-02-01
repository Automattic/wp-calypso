/**
 * External dependencies
 */
import React from 'react';
import { overEvery as and, negate as not } from 'lodash';
import { translate } from 'i18n-calypso';
import Gridicon from 'gridicons';

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
					translate( 'This page shows all the details about a specific theme. ' +
						'Ready for a little tour?' )
				}
			</p>
			<ButtonRow>
				<Next step="live-preview">{ translate( "Let's go!" ) }</Next>
				<Quit>{ translate( 'No, thanks.' ) }</Quit>
			</ButtonRow>
		</Step>

		<Step name="live-preview"
			target="theme-sheet-preview"
			placement="below"
			arrow="top-left"
			next="close-preview"
		>
			<p>
				{ translate( "Nothing beats seeing a theme in action. Try the live demo!" ) }
			</p>
			<ButtonRow>
				<Continue icon="themes" step="close-preview" target="theme-sheet-preview" click />
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
					translate( "This is what this theme looks like in action. Move around, click on things. Do you like what you're seeing?" )
				}
			</p>
			<ButtonRow>
				<Continue when={ not( isPreviewShowing ) } step="theme-docs">
				{
					translate( "Tap {{icon/}} to close the live demo.", {
						components: { icon: <Gridicon icon="cross" /> }
					} )
				}
				</Continue>
			</ButtonRow>
		</Step>

		<Step name="theme-docs"
			target=".theme__sheet-content .section-nav-tab:last-child"
			placement="beside"
			arrow="left-top"
		>
			<p>
				{
					translate( 'Each theme comes with a range of powerful features. ' +
						'Learn more about unlocking its full potential and setting it up on your site.' )
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
				{ translate( 'Is this the right theme for you? This button would pick the design for your site.' ) }
			</p>
			<ButtonRow>
				<Next step="back-to-list">{ translate( 'Maybe later' ) }</Next>
			</ButtonRow>
			<Continue step="back-to-list" target=".theme__sheet-primary-button" click hidden />
		</Step>

		<Step name="back-to-list"
			target=".theme__sheet-action-bar .header-cake__back.button"
			placement="beside"
			arrow="left-top"
			style={ { marginTop: '-15px', zIndex: 1 } }
		>
			<p>
				{
					translate( "That's it! " +
						'You can click on {{strong}}All Themes{{/strong}} at any time to return to our design showcase.', {
							components: { strong: <strong /> }
						} )
				}
			</p>
			<ButtonRow>
				<Quit primary>{ translate( 'Done' ) }</Quit>
			</ButtonRow>
		</Step>
	</Tour>
);
