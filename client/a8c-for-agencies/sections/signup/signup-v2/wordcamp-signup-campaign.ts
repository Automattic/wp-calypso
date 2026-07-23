export const WORDCAMP_SIGNUP_SOURCE = 'WordCamp US 2026 Signup Flow';

// Phoenix remains on UTC-7 year-round. This covers August 16–19 in local time.
const WORDCAMP_SIGNUP_START = Date.parse( '2026-08-16T07:00:00Z' );
const WORDCAMP_SIGNUP_END = Date.parse( '2026-08-20T07:00:00Z' );

export const isWordCampSignupActive = ( now = Date.now() ) =>
	now >= WORDCAMP_SIGNUP_START && now < WORDCAMP_SIGNUP_END;
