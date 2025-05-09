# Accessibility

This document provides some background on accessibility and how it fits in with our goals for Calypso.

If you're mainly here to learn what to test for as you write or review PRs, we also have an [Accessibility Checklist](accessibility-checklist.md).

## Overview

We need Calypso to be accessible to all our users. According to surveys done by WebAIM,

- 97.6% of screen reader users… [(2014)](http://webaim.org/projects/screenreadersurvey5/#javascript)
- 99.5% of users with low vision… [(2013)](http://webaim.org/projects/lowvisionsurvey/#javascript)
- 100% of users with motor disabilities… [(2013)](http://webaim.org/projects/motordisabilitysurvey/#javascript)

… use the internet with JavaScript enabled. These users can use Calypso if we make sure it's accessible and works with assistive technology.

For us, accessible means:

- There are text alternatives for non-text content (videos, images, audio, interactive elements like charts).
- Content can be accessed in different ways, from a computer, phone, or assistive technology, without losing meaning.
- All functionality is available using a keyboard.
- Users have enough time to read and react to content.
- Content is clearly outlined and well-labeled, so that users always know where they are and how to find what they want.
- Content is always localized, and the language of the page and sections are clearly labelled.
- We use labels and accessible notifications to let users know about errors and how to correct them.
- [We don't cause seizures](https://www.w3.org/WAI/WCAG20/quickref/#seizure) with animations or flashing notifications.
- We do all this within markup standards and best practices to ensure future compatibility.

— (paraphrased from the [WCAG 2.0 Overview](https://www.w3.org/WAI/WCAG20/glance/Overview))

For a detailed list of requirements, you can go to [the WCAG 2.0 customized quickref](https://www.w3.org/WAI/WCAG20/quickref/?currentsidebar=%23col_customize&levels=aaa&technologies=smil%2Cpdf%2Cflash%2Csl). There are 3 levels of criteria for each guideline, A (lowest), AA, and AAA (highest). For Calypso, we aim for WCAG 2.0 Level AA (which also includes level A). This is generally an agreed-upon standard for compliance with equal access laws.

## Automated Testing/Checking

Our ESLint rules include some basic accessibility checks using the [jsx-a11y plugin](https://github.com/evcohen/eslint-plugin-jsx-a11y).

## Resources

A collection of resources that will introduce you to the concept of accessibility and some of the standards behind it.

- [WebAIM](http://webaim.org/): WebAIM has provided comprehensive web accessibility solutions since 1999, and is one of the leading providers of web accessibility expertise internationally. WebAIM is a non-profit organization within the [Center for Persons with Disabilities](http://www.cpd.usu.edu/) at [Utah State University](http://www.usu.edu/). The site brings together a huge collection of information about web accessibility. Most of it is up to date and evergreen enough to help you. The [organization's blog](http://webaim.org/blog/) tackles many modern-day, evolving topics related to web accessibility.
- [W3C’s Web Accessibility Initiative](http://www.w3.org/WAI/): The World Wide Web Consortium's Web Accessibility Initiative provides strategies, guidelines and resources to make the Web accessible to people with disabilities.
- [The Six Simplest Accessibility Tests Anyone Can Do](http://www.karlgroves.com/2013/09/05/the-6-simplest-web-accessibility-tests-anyone-can-do/): A handful of simple things you can do to think about and implement accessibility with little effort as you work on projects.
- [Intro to Cognitive Accessibility](http://jkg3.com/Journal/cognitive-accessibility-101-part-1-what-is-cognitive-accessibility)
- Presentation: [Explorations in the Virtual DOM: How React.js Impacts Accessibility](https://marcysutton.github.io/react-a11y-presentation/)
- [Inclusive Design Fundamentals](https://isner.github.io/inclusive-design-fundamentals/), especially the [disability types](https://isner.github.io/inclusive-design-fundamentals/handouts/disability-types.html) to learn about how different disabilities affect how people use technology.
- [Inclusive Components Project](https://inclusive-components.design/): A growing list of component patterns for things like menus, tooltips, etc. along with information on why to use which ARIA properties.

### Going in depth

A set of blogs, written by accessibility consultants and evangelists that go in depth on all things accessibility.

- [The Paciello Group Blog](http://www.paciellogroup.com/blog/): A blog about web accessibility by one of the first accessibility consulting firms.
- [Simply Accessible](http://simplyaccessible.com/): A blog with in-depth web accessibility tutorials.
- [WebAxe](http://www.webaxe.org/): A blog and podcast about web accessibility.

## Tools

Find tools that will help you bring accessibility into your workflow.

### UX and Design

- [Accessibility for Designers](http://webaim.org/resources/designers/): An infographic about how designers can help create good, accessible websites.
- [The Complete Beginner's Guide to Universal Design](http://www.uxbooth.com/articles/the-complete-beginners-guide-to-universal-design/): A blog post that describes universal design, a set of considerations made to ensure that a product, service, and/or environment is usable by everyone, to the greatest extent possible, without the need for adaptation or specialized design.
- [Colllor](http://colllor.com/) and [0to255](http://0to255.com/): Both are tools that will generate different shades, tints and tones of colors, helpful when creating an accessible color palette.
- [Color Palette Evaluator by NC State](http://accessibility.oit.ncsu.edu/tools/color-contrast/index.php): Evaluate the contrast of different color palettes with the Color Palette Evaluator by NC State.
- [Tanaguru Contrast-Finder](http://contrast-finder.tanaguru.com/form.html): Find high contrast colors when you need them.

### Web Developers

- [aXe](https://www.deque.com/products/axe/): A browser add-on for evaluating the accessibility of web pages within the developer console.
- [Wave](http://wave.webaim.org/): A web tool and browser add-on for evaluating the accessibility of web pages.
- [NVDA](http://www.nvda-project.org/): A screenreader for Windows (open source).
- [JAWS](http://www.freedomscientific.com/products/fs/jaws-product-page.asp): The most popular screenreader. Available for Windows; costs money.
- [VoiceOver](http://www.apple.com/accessibility/voiceover/): Built-in screenreader for Mac.
- [VoiceOver for iOS](http://www.apple.com/accessibility/iphone/vision.html): Built-in screenreader for iOS.
- [Chrome Vox](http://www.chromevox.com/): A screenreader for ChromeOS.
- [WCAG 2.0 Cheat Sheet](http://www.w3.org/2009/cheatsheet/#wcag2) A simplified look at WCAG 2.0.
- [An Alt Text Decision Tree](http://dev.w3.org/html5/alt-techniques/developer.html#tree): A decision tree for deciding when and how to implement alt text in your work on the web. This is a work in progress by the editors of the HTML5 spec, but it's extremely useful in its current form.

