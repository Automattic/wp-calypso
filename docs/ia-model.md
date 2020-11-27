# Calypso IA Model

Calypso’s navigation architecture model is based on two key pieces:

1. Master bar
2. Left-to-Right

![Calypso IA Model](/calypso/images/devdocs/calypso-ai-model.png 'Calypso IA Model')

The [Masterbar](https://intenseminimalism.com/2013/the-master-bar-pattern-design-and-usage/) is the top-level piece of all our UIs across all the devices. It’s designed to work at desktop size, mobile size, web, iOS and Android alike.

The Left-to-Right logic instead means that everything else goes from a higher level of abstraction on the left, to a lower level of abstraction on the right, or from step 1 on the left and step N on the right. **Imagine the viewport to be a window on an horizontal sheet of paper that moves around based on what needs to be focused.**

My Sites is the clearest example we have so far: you access to it from the masterbar, then on the very left the first column is the list of sites, followed by the navigation menu for the site / all sites, then the content of that page, and then each section can dig further to the right.

This model works because the screen size determines only how many column are shown at each time: on desktop and tablet we show two (we could show more on bigger screens) and on mobile it’s just a standard drill down navigation from one column to the other. Always left-to-right, always big sheet sliding under the display.

We gain also the flexibility to focus on a specific column / view depending on where you’re coming from. For example when you switch to My Sites we can select the menu on mobile, instead of content which is primary on desktop.

The animations are meant to support this mental model, although this is still a work in progress.

## Effective to Design Multi-Screen

The model above is born to convert well to multiple devices and screens, so the main benefit of it is that following it allows a more seamless translation between the different screens and platforms, while already mapping to the platform standards.

So this is the current Calypso information architecture, mapped to the masterbar:

![Calypso IA](/calypso/images/devdocs/calypso-ai.png 'Calypso IA')

And this is how it translates multi platform:

![Calypso Nav v1](/calypso/images/devdocs/calypso-mobile-fit.png 'Calypso Nav v1')

It’s exactly the same structure, declined on different platform standards. It’s the ideal (and hard) balance between platform standards and our WordPress.com brand.
