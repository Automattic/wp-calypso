// How long to wait before each eligibility check once `/me` reports the email as confirmed. The
// endpoint can still answer `unverified` for a moment after the confirmation, so it's asked a few
// more times before the screen offers a manual retry. Four checks stay well under its rate limit.
export const CONFIRMED_RECHECK_DELAYS_MS = [ 0, 5000, 15000, 30000 ];
