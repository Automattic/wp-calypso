# @wordpress/a11y

Collection of JS modules for enhancing accessibility.

## Installation

Install the module

```bash
npm install @wordpress/a11y --save
```

## speak

Allows you to easily announce dynamic interface updates to screen readers using ARIA live regions. This module is inspired by the `speak` function in wp-a11y.js

### Usage

To make the `wp.a11y.speak` functionality more universally available, we've decided to create a dedicated JS module for it, called `speak`. Usage is very simple:

```JS
import { speak } from '@wordpress/a11y';

// For polite messages that shouldn't interrupt what screen readers are currently announcing.
speak( 'The message you want to send to the ARIA live region' );

// For assertive messages that should interrupt what screen readers are currently announcing.
speak( 'The message you want to send to the ARIA live region', 'assertive' );
```

### Background
For context I'll quote [this article on WordPress.org](https://make.wordpress.org/accessibility/2015/04/15/let-wordpress-speak-new-in-wordpress-4-2/) by [@joedolson](https://github.com/joedolson):

> #### Why.
> In modern web development, updating discrete regions of a screen with JavaScript is common. The use of AJAX responses in modern JavaScript-based User Interfaces allows web developers to create beautiful interfaces similar to Desktop applications that don’t require pages to reload or refresh.

> JavaScript can create great usability improvements for most users – but when content is updated dynamically, it has the potential to introduce accessibility issues. This is one of the steps you can take to handle that problem.

> #### What.
> When a portion of a page is updated with JavaScript, the update is usually highlighted with animation and bright colors, and is easy to see. But if you don’t have the ability to see the screen, you don’t know this has happened, unless the updated region is marked as an ARIA-live region.

> If this isn’t marked, there’s no notification for screen readers. But it’s also possible that all the region content will be announced after an update, if the ARIA live region is too large. You want to provide users with just a simple, concise message.

> #### How.
> That’s what `wp.a11y.speak()` is meant for. It’s a simple tool that creates and appends an ARIA live notifications area to the <body> element where developers can dispatch text messages. Assistive technologies will automatically announce any text change in this area. This ARIA live region has an ARIA role of “status” so it has an implicit aria-live value of polite and an implicit aria-atomic value of true.

> This means assistive technologies will notify users of updates but generally do not interrupt the current task, and updates take low priority. If you’re creating an application with higher priority updates (such as a notification that their current session is about to expire, for example), then you’ll want to create your own method with an aria-live value of assertive.

## Browser support

See https://make.wordpress.org/design/handbook/design-guide/browser-support/

<br/><br/><p align="center"><img src="https://s.w.org/style/images/codeispoetry.png?1" alt="Code is Poetry." /></p>
