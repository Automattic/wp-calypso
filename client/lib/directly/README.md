# Directly

[Directly's](https://www.directly.com/) Real Time Messaging (RTM) is an on-demand
customer support tool that we're using to provide live chat support to unpaid
customers. This module wraps the Directly RTM library and API to provide a modular
interface to its global functions.

## Docs

- [Directly's website](https://www.directly.com/)
- [RTM configuration guide](https://cloudup.com/cySVQ9R_O6S)

## Usage

**Unless you have a very good reason, you should interact with the RTM widget through
[its Redux interface](../../state/help/directly).**

Not all of the RTM widget API has been wrapped with this library. Refer to the [API
documentation](https://cloudup.com/cySVQ9R_O6S) to see other available methods, which
should be wrapped here rather than called using the `window.DirectlyRTM()` function.

The following functions are provided:

### `initialize()`

Configures the RTM widget and loads all its third-party assets (about 200KB at the time of
writing). If the user has recently interacted with the RTM widget, it will open up on
initialization (an unavoidable part of the library's mount).

### `askQuestion( questionText, name, email )`

Asks a question with the given params and opens the "Alerting experts" view. All parameters
are required strings. This also initializes the RTM widget if it hasn't already been done.

## Upgrading the RTM widget

We're self-hosting the primary RTM embed script. Instead of pulling from Directly's servers at
[https://www.directly.com/widgets/rtm/embed.js](https://www.directly.com/widgets/rtm/embed.js)
the script is hosted at
[http://widgets.wp.com/directly/embed.js](http://widgets.wp.com/directly/embed.js).
So if the RTM widget ever needs to be upgraded, you'll need to paste the new upgraded
script to our self-hosted file.

## Environments & testing

There are two Directly accounts so we can separate development / staging from production for testing.

- **Sandbox (dev/staging)**
  Login: <https://automattic-sandbox.directly.com>
  Apply to be an Expert: <https://automattic-sandbox.directly.com/apply>

- **Production**
  Login: <https://automattic.directly.com>
  Apply to be an Expert: <https://automattic.directly.com/apply>

To test user interactions with the RTM widget you'll want to apply for an Expert account
(most likely on the Sandbox environment). Once you apply your account will be reviewed
by an Expert Operations manager and approved. You most likely _don't_ want to be marked
as an "Official Expert" because user questions are routed more slowly to these accounts.

## Notes, quirks, and gotchas

- Directly's out-of-the-box integration code assumes you'll load the RTM widget on
  every pageload, but we need finer control. So our initialization code doesn't look
  quite like the standard setup in the docs, but should be documented well enough
  to see how it all fits together.

- The docs give many configuration options, however only one configuration can be
  applied per pageload. Since we may have multiple components interacting with Directly,
  we don't allow custom configuration. This avoids situations where components request
  separate configuration options (e.g. `questionCategory`) and it's not transparent
  which set of configs will be used.

- If a user has recently interacted with the RTM widget, it will open immediately
  on `initialize()`. This is built-in to the system and we don't have much direct control
  over it. There may be mitigation strategies if this becomes undesirable.

- The widget checks if the user is signed in to Directly with a call to their API:
  <https://www.directly.com/chat/checkAuth>. If you aren't signed in this request will
  return `401` and you'll see an error in the browser console. Directly's team has
  verified that this is expected and doesn't have negative side effects.

- User questions are routed more slowly to "Official Experts", so if you don't see
  questions appearing immediately in your Expert account you likely need to have the
  "Official" designation dropped from your account.
