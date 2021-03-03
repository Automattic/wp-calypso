# Calypso Design Tutorial

This document is for designers who are new to Calypso and the design patterns we use. This info is the most pertinent. Code style is not included. Some knowledge is undocumented, shared common knowledge. If something seems missing or confusing, please create an issue asking for help.

## Resources

- [UI Components](/devdocs/design)
- [Colors](https://dotcombrand.wordpress.com/color)
- [Typography](/devdocs/typography)
- [Icons](/devdocs/docs/icons.md)
- [IA Model](/devdocs/docs/ia-model.md)

## Common elements

### [SectionNav](/devdocs/design/section-nav) (aka ‘Filter Bar’)

Contains the main actions and ‘tabs’ for a section:
![Section Nav](https://cldup.com/fu2XX6KTu6.png 'Section Nav')

[SectionHeader](/devdocs/design/section-header) is essentially the same thing, but without tabs.

### [Headers](/devdocs/design/headers) (aka ‘Header Cake’)

- Essentially it’s a SectionHeader, with centered title and a back button.
- It’s used for navigating between views when you need more space for the UI you want to present.

### [Cards](/devdocs/design/cards) (also, FoldableCard)

Cards are the basic canvases we use to put UI in. They can take many forms. Many components require the base Card component.

### [Notices](/devdocs/design/notice)

- These are temporary messages to alert the user. They can be persistent, but should have an action or a way to close it.
- They appear inline with the rest of the UI.
- [GlobalNotices](/devdocs/design/global-notices) are notices that float/appear on top of the UI, and disappear after a certain amount of time.
- Notices should be used for important and urgent messages. Notices are not to be used for promotions, or anything that is not an alert.

### [Banners](/devdocs/design/banner)

- Often confused with notices, Banners are generic cards that inform users of promotions, help, or information that is not pertinent.

### [EmptyContent](/devdocs/design/empty-content)

- Use when there is no content to show.
- Change the illustration based on the context, and provide a CTA so users don’t feel lost.
