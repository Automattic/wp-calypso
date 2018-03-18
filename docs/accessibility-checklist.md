# Accessibility Checklist

This document aims to provide a quick testing workflow that will help you find and fix common accessibility issues, whether you're writing a PR or reviewing.

For more background and resources, see [Accessibility](accessibility.md).

## Testing Tools

* Do all `jsx-a11y` linting rules pass?
* Give it a once-over using the [aXe browser extension](https://www.deque.com/products/axe/) to spot any obvious issues.

## General Readability

* Is there sufficient contrast between any text and its background? Pay special attention to links, text in toolbars, and error messages.
* Are all links visually identifiable as such?
* Are any elements that indicate something using visual information (color, shape, location) supplemented with another indicator?
* Is your page still readable when you increase the text size using the browser's text zoom settings?
* Do any of the non-text elements on the page create a distraction?

## Keyboard Navigation

Try navigating the page using only your keyboard.

* Is there a visible indication of focus (can you tell where you are on the page)?
* Can you navigate to all elements on the screen? Does the order make sense?
* Does tabbing through a form take you through all the fields in a logical order?
* Can you interact with all interactive elements (dropdowns, buttons, etc.)?
* Can you interact with (including dismissing) any modals and error messages?

## Screen Reader Support

* Do all form controls have associated labels and ARIA tags?
* Are related form fields grouped with `fieldset` and described with `legend` tags?
* Do all images have [descriptive alt text](https://a11yproject.com/posts/alt-text/)?
* Do any visually-hidden elements have `aria-hidden` tags to hide them from screen readers?
* Do all links have descriptive text (saying where they go as opposed to something like "click here")?
* Do any modals or error messages provide useful feedback (via `aria-live` or similar tags)?
* If on a Mac, enable [VoiceOver](https://help.apple.com/voiceover/info/guide/10.12/) and try navigating the page.