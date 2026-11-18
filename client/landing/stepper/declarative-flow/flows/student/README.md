# Student Flow

Self-serve signup flow for the WordPress.com Student plan: checks that the account email is a verified academic email, then sends the user through domain selection and checkout with the Student plan at its regular price. Lives at `/setup/student`; `/start/student` and `/checkout/student` redirect there, keeping the query (and the locale, for `/start/student`). Students with an invitation code use the education flow (`/setup/education`) instead, whose invite code step links here for students without one.

## Testing instructions

1. Go to `/setup/student` and log in with an account whose `.edu`, `.ac.uk` or `.ac.jp` email is already confirmed — you land on the domain step and the Student plan is added to the cart. A new account starts unconfirmed and sees the step 3 screen first.
2. Pick a domain (or "Use a domain I own") and continue — a site is created and you're redirected to checkout with the Student plan (and domain) in the cart.
3. With an unverified academic email — you see "Confirm your email to get the Student plan", with a "Resend email" button. Open the link in the email (in any tab or device) and the page continues to the domain step on its own.
4. With a non-academic email (for example Gmail) — you see "The Student plan needs a school email", with links to sign up again, wp.com/education, `/setup/education` and `/setup/onboarding`.
5. With an active Student plan — you see "You already have the Student plan", with links to your sites and purchases.
6. Edge: open `/setup/student/domains` directly in a fresh session — you're redirected back to the eligibility step.
7. Open `/start/student`, `/start/student/es` and `/checkout/student` — each lands on `/setup/student` (the second one in Spanish).
8. On `/setup/education`, the line under "Validate invite code" reads "No code? Get the Student plan with your school email" and opens `/setup/student`.

## Owned by

@Automattic/martech

## Context

EDU-219, EDU-220, EDU-221, EDU-222, EDU-234
