# Guided Tours

Step-by-step tour framework for WordPress.com.

## What are Guided Tours?

Guided Tours is a framework for easily building tours that show users around a specific part of Calypso.

**Mission Statement:**

> Calypso is powerful, and therefore not easily understood by everyone.
> This leaves too many users behind.
> The Guided Tours framework lets us provide context-dependent and skill-appropriate tours that guide users through the UI.
> This will lead to more users finding value in Calypso earlier.

This is a screen capture of a tour ("siteTitle") that gets triggered when a user has been registered for two days or more but still hasn't changed their site's title from the default "Site Title":

![GIF of the `main` tour](https://cldup.com/puN2s7wFw9.gif)

The tour first asks the user whether they want to know more and then walks them through the UI. Tour authors should strive to not just show the user a series of descriptions for UI elements, but instead to have their tour be a guide that nudges users in the right direction. They should leave the clicking of buttons, entering of text, and changing of sections to the user. Also see: ["show, don't tell"](https://en.wikipedia.org/wiki/Show,_don't_tell).

These are the **core use cases** we currently see for Guided Tours:

- Help new users understand what they should be doing next. E.g. guide a new user who hasn't written a blog post yet through the creation of their first one.
- Provide immersive tutorials that help semi-advanced users understand Calypso better. E.g. explain how to set up publicize. Such a tour could be triggered by certain user behavior, or could be linked to using a special URL (see e.g. the experimental `main` tour: [https://wordpress.com/?tour=main](https://wordpress.com/?tour=main)). There's also a Redux acton to trigger a tour -- see [docs/API.md](docs/API.md) for details.
- Tours that help address common oversights, such as the title tour mentioned above.
- Announce new or changed features.

Guided Tours sits on top of Calypso, and conceptually isn't part of the UI — one could think of it as a "meta UI". The design of the steps is different from the default Calypso design for this reason: we want Guided Tours to be obviously _not_ part of normal Calypso.

## Getting Started

To help you get started with creating your own tours, we have one tutorial available.

Tutorial: [Building a Simple Tour](docs/TUTORIAL.md)

## API Overview

See [docs/API.md](docs/API.md)

## List of Tours

- [Main Tour](tours/main-tour.js): This tour is just an example and shouldn't be used in production. It helps useful for trying out framework features and can act as a bit of a canary for problems. The tour shows a few important features of Calypso and was built to help new users find their way around. It didn't perform too well in a test, though, and since then has been used in the aforementioned capacity. ([URL scheme to trigger.](https://wordpress.com/?tour=main))

## Further Reading

- [In-depth architecture overview](docs/ARCHITECTURE.md)
