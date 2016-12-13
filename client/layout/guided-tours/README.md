# Guided Tours

Step-by-step tour framework for WordPress.com.

_(Documentation in progress)_

## What is Guided Tours? 

_(TODO: add a high-level overview: what is the problem we're solving and why?)_

## Getting Started: Building a Simple Tour

_(TODO: add a simple tour and instructions on how to build it)_

## API Overview

_(TODO: document all the elements in `config-elements.js`)_

## List of Tours

- [Main Tour](tours/main-tour.js): This tour shows a few important features of Calypso and is intended to help new users find their way around. In a test it performed worse than Trampoline, so it isn't currently being triggered. In the future, a combination of Trampoline and this tour could be considered. ([URL scheme to trigger.](https://wordpress.com/?tour=main))
- [Site Title Tour](tours/site-title-tour.js): This tour guides the users through changing their site's title: go to settings, show site title and site tagline input fields, save settings. We don't use the Customizer to change the site title because Guided Tours is currently not available there (the Customizer is not Calypso-based, but rather an iframe on top of Calypso). It will get triggered under `/stats` paths for users with an account age of more than two days who are on desktop and haven't changed their site's title from the default ("Site Title" or the localized version of that or the first part of the site slug) yet. We also check whether they have the permissions to actually change the title and only run the tour if they do. ([URL scheme to trigger.](https://wordpress.com/stats/day/SITE_SLUG_HERE?tour=siteTitle))
- [Theme Sheet Welcome Tour](tours/theme-sheet-welcome-tour.js): This tour briefly shows the most important features of the theme detail sheet: live demo, docs, activation, back to themes list. It will get triggered under `/theme` paths (i.e. the theme detail sheet) for new users (account age <= a week) on desktop. ([URL scheme to trigger.](https://wordpress.com/theme/twentyfifteen/SITE_SLUG_HERE?tour=themeSheetWelcomeTour))
- [Design Showcase Welcome Tour](tours/design-showcase-welcome-tour.js): This tour explains the the design showcase's most important UI elements. It will get triggered under `/design` paths (i.e. the design showcase / searchable list of themes) for new users (account age <= a week) on desktop, given that they can change the theme for the current site. ([URL scheme to trigger.](https://wordpress.com/design/SITE_SLUG_HERE?tour=designShowcaseWelcome))

## Further Reading

- [In-depth architecture overview](docs/ARCHITECTURE.md)
