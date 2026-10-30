# Site credits

Chats outside the dock that show the site's AI credits, such as Image Studio, use these exports so they match the dock.

## Balance

- `parseLiveCreditsStatus( value, siteId )` turns a site's allowance snapshot into a `CreditsStatus`, or `undefined` if the snapshot isn't valid.
- `CreditsMeter` shows that status.
- `formatCreditsShort()` formats an amount such as "800" or "8.5k", rounding down.
- `CREDITS_LOW_BALANCE` is the 10,000-credit balance below which a paid plan runs low: the meter swaps its info icon for an alert icon on a red tint, and the low-balance notice shows. Free plans run low at 20% or below.

## Purchase links

`getCreditsPurchaseLink( status, site, isSimpleSite, aiSessionId? )` picks the dock's link by the site's plan. It takes the site's domain or ID, and returns `undefined` for an unknown plan.

| Plan               | Link        | Destination                          |
| ------------------ | ----------- | ------------------------------------ |
| Personal, Premium  | Upgrade     | The plans page                       |
| Business, Commerce | Add credits | Checkout for one 100,000-credit pack |

Both links carry:

- **`source`**: `CREDITS_UPGRADE_SOURCE`, which Tracks events also send as `ref`.
- **`ai_session_id`**: the session the chat's click event sends, which joins a purchase to the click and the conversation behind it. Checkout saves it on the purchase, and the plans page passes it on to checkout. A missing or empty session, or `none`, leaves it out.

Add credits also carries a return address, as Jetpack AI's upgrade link does: the post open in a Simple site's editor, or else the site's home. Checkout gets it as both `redirect_to` and `cancel_to`. Upgrade carries neither: the plans page would pass `redirect_to` on to checkout, which then skips its own pages after a plan purchase, and only its downgrade and renewal buttons read `cancel_to`.

## Who can buy

Checkout refuses an upgrade from most people who didn't buy the plan, though any site admin can buy a credits pack. So pass the link through `getCreditsPurchaseOptions( link, access )`, with the `access` that `parseCreditsAccess()` reads from the `/ai/credits` response:

- It keeps an Upgrade link only when the response says `can_upgrade: true`, and an Add credits link only when it says `can_buy_credits: true`.
- For someone the response says can't buy, it gives `askToUpgrade`, naming who to ask (`site-admin` or `plan-owner`), and a `purchaseHint` for `CreditsMeter` to show instead of the button.
- When the response doesn't say, it gives nothing.

## Calls to action

- `getCreditsPurchaseAction( options )` turns `getCreditsPurchaseOptions()`'s result into a button labelled Upgrade or Add credits that opens in a new tab. The chat notice's `action` and `CreditsMeter`'s `action` both take it; add an `onClick` to record the click.
- `getCreditsNoticeMessage( level, remaining, askToUpgrade? )` gives the low (`low`) or zero-balance (`out`) notice, naming who to ask.

## Refusals

In the dock, a reply the server refuses because the site has used all its credits (`ai_credit_allowance_exhausted`) shows a message card in the thread, through agenttic-ui's `errorNotice`, in place of the error's text: "Your message wasn’t sent", or "Your request didn’t complete" when an agent message (a reply, or a tool's message such as a block edit's summary) came after the latest typed question, then "Add credits to keep working." or "Upgrade to keep working." to match the purchase, which is the card's link. Someone who can't buy gets the title alone. It shows while the error does and the thread has messages, and stays as a record once credits are back; while the balance is unknown, as after a failed read, the last card stays, and a refusal that brings no balance keeps the error's text until a read lands. The next turn or New chat drops it. The notice above the composer stays meanwhile: the zero-balance notice with its button, which also says who to ask, and then "Your site has credits again." once a read shows the balance above 0 again (a top-up, a reset or an upgrade), with Continue, which sends the composer's text, or the refused question's when the composer is empty, through the composer's retry send; a question with images is asked again by hand. The credits popover doesn't open by itself. A click on the card sends the usual `cta_clicked` event with `placement: 'refusal'`, with the balance it last showed while the current one is unknown; clicks on the composer's notice and the popover send `placement: 'none'`. The credits-back notice sends nothing, and a low notice it covers records `notice_shown` once it shows. Other credits refusals, and Reader Chat, keep the error's text.

## Tracks

The credits events send these values, so other chats report the same as the dock:

- `getCreditsCtaType( purchaseKind, askToUpgrade? )` gives `cta_type`.
- `getTopUpCreditsLeft( status )` gives `top_up_credits_left`: the top-ups row's balance, or `none` when no row shows.
- `getAgentEnvironment( contextProvider? )` gives `agent_environment`: the `environment` from a chat's `contextProvider`, unchanged, or `none` when it's missing or can't be read.
