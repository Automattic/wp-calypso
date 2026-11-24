// TEMPORARY: These apps *should* be type-checked, but there are existing issues that need to be
// resolved. Both the CI type check (bin/unit-test-suite.mjs) and `yarn typecheck-apps` skip them.
export const APPS_EXCLUDED_FROM_TYPE_CHECK = [
	'happy-blocks',
	'o2-blocks',
	'odyssey-stats',
	'notifications',
	'wpcom-block-editor',
];
