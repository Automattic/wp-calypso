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

_(TODO: document all the elements in `config-elements.js`)_

## List of Tours

_(TODO: add tour descriptions)_

- [Main Tour](tours/main-tour.js)
- [Site Title Tour](tours/site-title-tour.js)
- [Theme Sheet Welcome Tour](tours/theme-sheet-welcome-tour.js)
- [Design Showcase Welcome Tour](tours/design-showcase-welcome-tour.js)

## Further Reading

- [In-depth architecture overview](docs/ARCHITECTURE.md)
