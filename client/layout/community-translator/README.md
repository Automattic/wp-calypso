Community Translator Components
===============================

## Translator Launcher

This component shows a button in the bottom right corner of the screen to allow the user to activate and deactivate the Community Translator.  It is only visible when the user has enabled the Community Translator, and is using a non-English interface language.  The launcher is also hidden if if the browser has a small screen or touch capabilities.

## Translator Invitation

This component is a prominent message that we show to users to encourage awareness and use of the Community Translator.  The Invitation component itself is fairly straightforward, but the utils module has multiple functions:

 * Filtering participants (language, previous interaction, abtest buckets)
 * Tracks events
 * Managing A/B testing
 * Enabling the translator if the user accepts the invitation
 * Triggering a react update once the invitation is resolved
