/** @ssr-ready **/

import React from 'react';

import { getSectionName, isPreviewShowing } from 'state/ui/selectors';
import { isNewUser } from 'state/ui/guided-tours/selectors';
import { isFetchingNextPage, getQueryParams, getThemesList } from 'state/themes/themes-list/selectors';
import {
	makeTour,
	Tour,
	Step,
	Next,
	Quit,
	Continue,
} from 'layout/guided-tours/config-elements';
import { translate } from 'i18n-calypso';

const previewIsNotShowing = state =>
	! isPreviewShowing( state );

const context = state =>
	true || isNewUser( state );

const themeSearchResultsFound = state => {
	const params = getQueryParams( state );
	return params && params.search && params.search.length && ! isFetchingNextPage( state ) && getThemesList( state ).length > 0;
};

const themeFreeFilterChosen = state => {
	const params = getQueryParams( state );
	return params && params.tier === 'free';
};

const inSection = ( sectionName ) => state =>
	getSectionName( state ) === sectionName;

export const ThemesTour = makeTour(
	<Tour name="themes" version="20160601" path="/design" context={ context }>
		<Step name="init" placement="right" next="search" className="guided-tours__step-first">
			<p className="guided-tours__step-text">
				Hey there! Want me to show you how to find a great theme for your site?
			</p>
			<div className="guided-tours__choice-button-row">
				<Next step="my-sites">{ translate( "Let's go!" ) }</Next>
				<Quit>{ translate( 'No thanks.' ) }</Quit>
			</div>
		</Step>

		<Step name="search"
			target=".themes__search-card .search-open__icon"
			placement="below"
			arrow="top-left"
			next="filter"
		>
			<p className="guided-tours__step-text">
				Search for a specific theme name or feature here. Try typing something — for example, "business".
			</p>
			<p className="guided-tours__actionstep-instructions">
				<Continue context={ themeSearchResultsFound } hidden/>
			</p>
		</Step>

		<Step name="filter"
			target="themes-tier-dropdown"
			placement="above"
			arrow="bottom-right"
			next="choose-theme"
		>
			<p className="guided-tours__step-text">
				Here you can filter between free and premium themes. Try filtering by _free_ themes now.
			</p>
			<p className="guided-tours__actionstep-instructions">
				<Continue context={ themeFreeFilterChosen } hidden/>
			</p>
		</Step>

		<Step name="choose-theme"
			className="guided-tours__step-action"
			placement="center"
			context={ inSection( 'themes' ) }
			next="tab-bar"
		>
			<p className="guided-tours__step-text">
				Tap on a theme to see more details — such as screenshots, the theme's features, or a preview.
			</p>
			<p className="guided-tours__actionstep-instructions">
				<Continue context={ inSection( 'theme' ) } />
			</p>
		</Step>

		<Step name="tab-bar"
			placement="center"
			context={ inSection( 'themes' ) }
			next="live-preview"
		>
			<p className="guided-tours__step-text">
				Here you can take a look at more screenshots of the theme, read about its features, or get help on how to use it.
			</p>
			<div className="guided-tours__choice-button-row">
				<Next/>
				<Quit/>
			</div>
		</Step>

		<Step name="live-preview"
			className="guided-tours__step-action"
			target="theme-sheet-preview"
			placement="below"
			arrow="top-left"
			context={ inSection( 'theme' ) }
			next="close-preview"
		>
			<p className="guided-tours__step-text">
				Tap here to see a _live demo_ of the theme.
			</p>
			<p className="guided-tours__actionstep-instructions">
				<Continue target="theme-sheet-preview" click />
			</p>
		</Step>

		<Step name="close-preview"
			target=".web-preview.is-visible [data-tip-target='web-preview__close']"
			arrow="left-top"
			placement="beside"
			context={ isPreviewShowing }
			next="back-to-list"
		>
			<p className="guided-tours__step-text">
				This is the theme's preview. Take a look around! Then tap to close the preview.
			</p>
			<p className="guided-tours__actionstep-instructions">
				<Continue context={ previewIsNotShowing } />
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
				<Continue context={ inSection( 'themes' ) } />
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
