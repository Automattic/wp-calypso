# Pressable plan rename — screenshot capture list

Every state below was loaded and verified on the branch `visual/pressable-plan-rename`.
The PNGs are **not** in this folder: the browser tooling available here returns
screenshots into the conversation and cannot write image files to this path, and its
capture is fixed at 1232px rather than 1440px. Capture these eight states yourself at
1440px wide and drop them in here.

Both dev servers must be running, and you must be signed in to WordPress.com in the same
browser.

## Dashboard A — current marketplace

`http://agencies.localhost:3002/marketplace/hosting/pressable`

The tab and slider selection persist in local storage between reloads, so set each state
explicitly.

| # | File | State | How to reach it |
| --- | --- | --- | --- |
| 1 | `a-standard.png` | Standard tab, slider at 1 | Click **Standard**; drag slider to the first stop |
| 2 | `a-agency.png` | Agency tab | Click **Agency** |
| 3 | `a-performance.png` | Performance tab (referral pitch) | Click **Performance** with *Refer products* off |
| 4 | `a-performance-referral.png` | Performance tab, plan slider | Turn *Refer products* on (top right), click **Performance** |
| 5 | `a-performance-custom.png` | Performance Custom | *Refer products* off, **Agency** tab, click the **More** stop |

## Dashboard B — new marketplace

`http://my.a4a.localhost:3000/marketplace/hosting` → **Pressable** tab

| # | File | State | How to reach it |
| --- | --- | --- | --- |
| 6 | `b-standard.png` | Standard plan type | Pressable tab (default state) |
| 7 | `b-agency.png` | Agency plan type | Click the **Agency** card |
| 8 | `b-performance.png` | Performance plan type | Click the **Performance** card |

Optional, and worth including — the returning-customer variant, which exercises the
"Your Pressable *X* plan" header and the "Upgrade to *X*" button:

`http://my.a4a.localhost:3000/marketplace/hosting?existing` → **Pressable** tab
→ `b-existing-customer.png`
