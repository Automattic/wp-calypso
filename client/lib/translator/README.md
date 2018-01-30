Community Translator Integration
================================

This module contains the necessary code to launch the external [Community Translator](http://github.com/Automattic/community-translator)

## What it does

 - It collects (via calls to `logTranslatedString`) the strings passed through the i18n mixin `i18n.translate()` and puts the data in the `window.translatorJumpstart` global object.
 - It displays a launcher if the following conditions are met:
  - `community-translator` is enabled in the config
  - The user has set the _Enable on page translation_ option in his user settings
  - The user UI language is not English
  - Checks for required features ( A larger screen and 'does not have touch' as an approximation of 'has a right mouse button')
 - Once the launcher is clicked, the community translator script is loaded (via `loadScript`).

## Environment specific functionality

 - The launcher controls which GlotPress instance and project the Community-Translator communicates with. This will be https://translate.wordpress.com/projects/wpcom/ by default. In a non-production environment however, the project set to will be `test` instead of `wpcom`.
 - Debug output is enabled in the browser with `localStorage.setItem( 'debug', 'calypso:community-translator' )` or `localStorage.setItem( 'debug', 'calypso:i18n,calypso:community-translator' )` if you want to also include the information about the displayed translated strings.
