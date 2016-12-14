# Guided Tours

Step-by-step tour framework for WordPress.com.

_(Documentation in progress)_

## What is Guided Tours? 

Guided Tours is a framework for easily building tours that show users around a specific part of Calypso. 

**Mission Statement:**

> Calypso is powerful, and therefore not easily understood by everyone.
This leaves too many users behind.
The Guided Tours framework lets us provide context-dependent and skill-appropriate tours that guide users through the UI.
This will lead to more users finding value in Calypso earlier.

This is a screen capture of a tour ("siteTitle") that gets triggered when a user has been registered for two days or more but still hasn't changed their site's title from the default "Site Title":

![GIF of the `main` tour](docs/img/tour-site-title.gif)

The tour first asks the user whether they want to know more and then walks them through the UI. Tour authors should strive to not just show the user a series of descriptions for UI elements, but instead to have their tour be a guide that nudges users in the right direction. They should leave the clicking of buttons, entering of text, and changing of sections to the user. Also see: ["show, don't tell"](https://en.wikipedia.org/wiki/Show,_don't_tell). 

These are the **core use cases** we currently see for Guided Tours:

- Help new users understand what they should be doing next. E.g. guide a new user who hasn't written a blog post yet through the creation of their first one. 
- Provide immersive tutorials that help semi-advanced users understand Calypso better. E.g. explain how to set up publicize. Such a tour could be triggered by certain user behavior, or could be linked to using a special URL (see e.g. [https://wordpress.com/?tour=main](https://wordpress.com/?tour=main)). 
- Tours that help address common oversights, such as the title tour mentioned above. 
- Announce new or changed features. 

Guided Tours sits on top of Calypso, and conceptually isn't part of the UI — one could think of it as a "meta UI". The design of the steps is different from the default Calypso design for this reason: we want Guided Tours to be obviously *not* part of normal Calypso. 

## Getting Started: Building a Simple Tour

_(TODO: add a simple tour and instructions on how to build it)_

## API Overview

### Tour

Tour is a top-level declaration of a tour. It defines conditions for starting a tour and contains `<Step>` components as children.

### Step

Step is a React component that defines a single Step of a tour. Step can be positioned in many ways in relation to any DOM node in Calypso that is marked with `[data-tip-target]` attribute.

### ButtonRow

ButtonRow is a React component to display button controls in Step and takes care of their proper styling. No props, just put your controls as children.

### Continue

Continue is a React component that you can use in Step to programmatically continue the tour to other step based on user interaction with Calypso. There are currently two ways to declare the condition to continue the tour.

- binding an `onClick` listener to any DOM element in Calypso
- redux selector function that evaluates to true in order to advance the tour

### Next

Link is a React component that shows a button that allows users to advance tour to another step. To be used inside of `<ButtonRow>`.

### Quit

Quit is a React component that shows a button that allows users to quit current tour. To be used inside of `<ButtonRow>`.

### Link

Link is a React component that shows a Link to external page in Step. It takes care of styling and makes sure the link always opens in a new browser tab. We usually use it in the last step of tour where we nudge user to explore the docs to learn more about the area we just covered with a tour.

## List of Tours

- [Main Tour](tours/main-tour.js): This tour shows a few important features of Calypso and is intended to help new users find their way around. In a test it performed worse than Trampoline, so it isn't currently being triggered. In the future, a combination of Trampoline and this tour could be considered. ([URL scheme to trigger.](https://wordpress.com/?tour=main))
- [Site Title Tour](tours/site-title-tour.js): This tour guides the users through changing their site's title: go to settings, show site title and site tagline input fields, save settings. We don't use the Customizer to change the site title because Guided Tours is currently not available there (the Customizer is not Calypso-based, but rather an iframe on top of Calypso). It will get triggered under `/stats` paths for users with an account age of more than two days who are on desktop and haven't changed their site's title from the default ("Site Title" or the localized version of that or the first part of the site slug) yet. We also check whether they have the permissions to actually change the title and only run the tour if they do. ([URL scheme to trigger.](https://wordpress.com/stats/day/SITE_SLUG_HERE?tour=siteTitle))
- [Theme Sheet Welcome Tour](tours/theme-sheet-welcome-tour.js): This tour briefly shows the most important features of the theme detail sheet: live demo, docs, activation, back to themes list. It will get triggered under `/theme` paths (i.e. the theme detail sheet) for new users (account age <= a week) on desktop. ([URL scheme to trigger.](https://wordpress.com/theme/twentyfifteen/SITE_SLUG_HERE?tour=themeSheetWelcomeTour))
- [Design Showcase Welcome Tour](tours/design-showcase-welcome-tour.js): This tour explains the the design showcase's most important UI elements. It will get triggered under `/design` paths (i.e. the design showcase / searchable list of themes) for new users (account age <= a week) on desktop, given that they can change the theme for the current site. ([URL scheme to trigger.](https://wordpress.com/design/SITE_SLUG_HERE?tour=designShowcaseWelcome))

## Further Reading

- [In-depth architecture overview](docs/ARCHITECTURE.md)
