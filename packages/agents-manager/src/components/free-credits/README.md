# Free credits — presentation experiment

Four ways to present a Jetpack AI free-credit balance in the AI sidebar, built
so they can be compared against a live chat. **There is no backend behind
this** — the balance is seeded from the URL and spent locally.

The experiment is off unless a URL param asks for it, so the sidebar renders
exactly as it does today by default.

## Surfaces

| Surface     | Where it renders                    | Reads best for                                     |
| ----------- | ----------------------------------- | -------------------------------------------------- |
| `pill`      | Chat header, next to the actions    | Always-visible count with no room for copy         |
| `banner`    | Chat footer, above the composer     | Persistent balance while chatting                  |
| `card`      | Empty view, under the suggestions   | Setting expectations before the first message      |
| `exhausted` | Chat footer, replaces the composer  | The zero-balance upgrade moment                    |

`banner` hides itself at zero when `exhausted` is on, so the two don't stack.
While gated, the composer stays mounted but read-only — unmounting it resets
agenttic's input state.

## URL params

| Param              | Meaning                                                     |
| ------------------ | ----------------------------------------------------------- |
| `ai-credits`       | Credits remaining. Any `ai-credits*` param turns the experiment on. |
| `ai-credits-total` | Monthly allowance. Defaults to 20.                          |
| `ai-credits-ui`    | Comma-separated surfaces, or `all` / `none`. Defaults to all. |

```
?ai-credits=12                          # all four surfaces, 12 of 20 left
?ai-credits=3                           # low-balance (warning) tone
?ai-credits=0                           # the upgrade gate
?ai-credits=12&ai-credits-ui=banner     # one surface at a time
?ai-credits=8&ai-credits-total=50&ai-credits-ui=pill,card
```

Params win over the persisted session, so a link always shows what it says.
Without any param the last state is restored from `sessionStorage`, which keeps
the experiment alive across SPA navigation.

## Console API

`window.__agentsManagerFreeCredits` is available while a chat is mounted:

```js
__agentsManagerFreeCredits.get();                    // current state
__agentsManagerFreeCredits.set( { remaining: 1 } );  // jump to a state
__agentsManagerFreeCredits.set( { surfaces: [ 'card' ] } );
__agentsManagerFreeCredits.consume();                // spend one
__agentsManagerFreeCredits.reset();                  // back to full
```

Sending a message spends a credit, so the surfaces can be watched counting
down to the gate.

## Making it real

Replace `readInitialState()` in `store.ts` with the entitlement source and drop
the URL/session seeding. The surfaces themselves only read `remaining`, `total`
and `surfaces`, and take an optional `onUpgrade` handler that currently does
nothing — wire it to checkout.
