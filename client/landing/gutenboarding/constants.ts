/**
 * Debounce our input + HTTP dependent select changes
 *
 * Rapidly changing input generates excessive HTTP requests.
 * It also leads to jarring UI changes.
 *
 * @see https://stackoverflow.com/a/44755058/1432801
 */
export const selectorDebounce = 300;

export const fontPairings = [
	[
		{ title: 'Cabin', fontFamily: 'Cabin' },
		{ title: 'Raleway', fontFamily: 'Raleway' },
	],
	[
		{ title: 'Chivo', fontFamily: 'Chivo' },
		{ title: 'Open Sans', fontFamily: 'Open Sans' },
	],
	[
		{ title: 'Playfair', fontFamily: 'Playfair Display' },
		{ title: 'Fira Sans', fontFamily: 'Fira Sans' },
	],
	[
		{ title: 'Arvo', fontFamily: 'Arvo' },
		{ title: 'Montserrat', fontFamily: 'Montserrat' },
	],
	[
		{ title: 'Space Mono', fontFamily: 'Space Mono' },
		{ title: 'Roboto', fontFamily: 'Roboto' },
	],
] as const;
