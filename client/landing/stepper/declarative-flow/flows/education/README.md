# Education Flow

Signup flow for the WordPress.com Education Program: validates a student invite code, then sends the user through domain selection and checkout with the Student plan preselected. Lives at `/setup/education`.

## Testing instructions

1. Go to `/setup/education` and create an account (or log in).
2. Enter a valid invite code and press "Validate invite code" — you land on the domain step and the Student plan is added to the cart.
3. Pick a domain (or "Use a domain I own") and continue — a site is created and you're redirected to checkout with the Student plan (and domain) in the cart.
4. Edge: enter an invalid code — an inline "Invitation code not found" error shows and the same code stays submittable.
5. Edge: refresh on the processing screen — you're routed back into the flow, not to the error page.
6. Edge: open `/setup/education/domains` directly in a fresh session — you're redirected back to the invite code step.

## Owned by

@gmovr and @Automattic/martech

## Context

DOTCOM-17536
