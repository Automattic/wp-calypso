/** @ssr-ready **/

import React from 'react';

import {
	isNewUser,
	themeSearchResultsFound,
	themeFreeFilterChosen,
	inSection,
	previewIsShowing,
	previewIsNotShowing,
} from 'state/ui/guided-tours/contexts';
import {
	makeTour,
	Tour,
	Step,
	Next,
	Quit,
	Continue,
} from 'layout/guided-tours/config-elements';
import { translate } from 'i18n-calypso';

const context = state =>
	true || isNewUser( state );

export const ThemesTour = makeTour(
	<Tour name="themes" version="20160601" path="/design" context={ context }>
		<Step name="init" placement="right" className="guided-tours__step-first">
			<p className="guided-tours__step-text">
				Hey there! Want me to show you how to find a great theme for your site?
			</p>
			<div className="guided-tours__choice-button-row">
				<Next step="search">{ translate( "Let's go!" ) }</Next>
				<Quit>{ translate( 'No thanks.' ) }</Quit>
			</div>
		</Step>

		<Step name="search"
			target=".themes__search-card .search-open__icon"
			placement="below"
			arrow="top-left"
		>
			<p className="guided-tours__step-text">
				Search for a specific theme name or feature here. Try typing something — for example, "business".
			</p>
			<p className="guided-tours__actionstep-instructions">
				<Continue step="filter" target=".themes__search-card .search-open__icon" context={ themeSearchResultsFound } hidden/>
			</p>
		</Step>

		<Step name="filter"
			pointsAt="themes-tier-dropdown"
			placement="above"
			arrow="bottom-right"
		>
			<p className="guided-tours__step-text">
				Here you can filter between free and premium themes. Try filtering by _free_ themes now.
			</p>
			<p className="guided-tours__actionstep-instructions">
				<Continue step="choose-theme" target="themes-tier-dropdown" context={ themeFreeFilterChosen } hidden/>
			</p>
		</Step>

		<Step name="choose-theme"
			className="guided-tours__step-action"
			placement="center"
			context={ inSection( 'themes' ) }
		>
			<p className="guided-tours__step-text">
				Tap on a theme to see more details — such as screenshots, the theme's features, or a preview.
			</p>
			<p className="guided-tours__actionstep-instructions">
				<Continue step="tab-bar" context={ inSection( 'theme' ) } />
			</p>
		</Step>

		<Step name="tab-bar"
			placement="center"
			context={ inSection( 'themes' ) }
		>
			<p className="guided-tours__step-text">
				Here you can take a look at more screenshots of the theme, read about its features, or get help on how to use it.
			</p>
			<div className="guided-tours__choice-button-row">
				<Next step="live-preview" />
				<Quit/>
			</div>
		</Step>

		<Step name="live-preview"
			className="guided-tours__step-action"
			target="theme-sheet-preview"
			placement="below"
			arrow="top-left"
			context={ inSection( 'theme' ) }
		>
			<p className="guided-tours__step-text">
				Tap here to see a _live demo_ of the theme.
			</p>
			<p className="guided-tours__actionstep-instructions">
				<Continue step="close-preview" target="theme-sheet-preview" click />
			</p>
		</Step>

		<Step name="close-preview"
			target=".web-preview.is-visible [data-tip-target='web-preview__close']"
			arrow="left-top"
			placement="beside"
			context={ previewIsShowing }
		>
			<p className="guided-tours__step-text">
				This is the theme's preview. Take a look around! Then tap to close the preview.
			</p>
			<p className="guided-tours__actionstep-instructions">
				<Continue step="back-to-list" context={ previewIsNotShowing } />
			</p>
		</Step>

		<Step name="back-to-list"
			target=".theme__sheet-action-bar .header-cake__back.button"
			placement="beside"
			icon="arrow-left"
			arrow="left-top"
		>
			<p className="guided-tours__step-text">
				You can go back to the themes list here.
			</p>
			<p className="guided-tours__actionstep-instructions">
				<Continue step="finish" context={ inSection( 'themes' ) } />
			</p>
		</Step>

		<Step name="finish"
			placement="center"
			className="guided-tours__step-finish"
			context={ inSection( 'themes' ) }
		>
			<p className="guided-tours__step-text">
				That's it!
			</p>
			<div className="guided-tours__single-button-row">
				<Quit primary>{ translate( "We're all done!" ) }</Quit>
			</div>
		</Step>
	</Tour>
);
