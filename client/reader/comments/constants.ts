export const NUMBER_OF_COMMENTS_PER_FETCH = 50;

export const PLACEHOLDER_STATE = {
	PENDING: 'PENDING',
	ERROR: 'ERROR',
} as const;

// Values also correspond to CSS class names applied to comments.
export const POST_COMMENT_DISPLAY_TYPES = {
	singleLine: 'is-single-line',
	excerpt: 'is-excerpt',
	full: 'is-full',
} as const;
