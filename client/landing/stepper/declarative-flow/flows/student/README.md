# Student Flow

Self-serve signup flow for the WordPress.com Student plan: checks that the account email is a verified academic email, then sends the user through domain selection and checkout with the Student plan at its regular price. Lives at `/setup/student`. Students with an invitation code use the education flow (`/setup/education`) instead.

## Testing instructions

1. Go to `/setup/student` and log in with an account whose `.edu`, `.ac.uk` or `.ac.jp` email is already confirmed — you land on the domain step and the Student plan is added to the cart. A new account starts unconfirmed and sees the step 3 screen first.
2. Pick a domain (or "Use a domain I own") and continue — a site is created and you're redirected to checkout with the Student plan (and domain) in the cart.
3. With an unverified academic email — you see "Confirm your email to get the Student plan".
4. With a non-academic email (for example Gmail) — you see "The Student plan needs a school email", with links to sign up again, wp.com/education, `/setup/education` and `/setup/onboarding`.
5. With an active Student plan — you see "You already have the Student plan", with links to your sites and purchases.
6. Edge: open `/setup/student/domains` directly in a fresh session — you're redirected back to the eligibility step.

## Owned by

@Automattic/martech

## Context

EDU-219, EDU-220, EDU-221, EDU-222
