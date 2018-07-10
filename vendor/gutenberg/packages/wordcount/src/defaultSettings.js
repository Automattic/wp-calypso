export const defaultSettings = {
	HTMLRegExp: /<\/?[a-z][^>]*?>/gi,
	HTMLcommentRegExp: /<!--[\s\S]*?-->/g,
	spaceRegExp: /&nbsp;|&#160;/gi,
	HTMLEntityRegExp: /&\S+?;/g,

	// \u2014 = em-dash
	connectorRegExp: /--|\u2014/g,

	// Characters to be removed from input text.
	removeRegExp: new RegExp( [
		'[',

		// Basic Latin (extract)
		'\u0021-\u0040\u005B-\u0060\u007B-\u007E',

		// Latin-1 Supplement (extract)
		'\u0080-\u00BF\u00D7\u00F7',

		/*
		 * The following range consists of:
		 * General Punctuation
		 * Superscripts and Subscripts
		 * Currency Symbols
		 * Combining Diacritical Marks for Symbols
		 * Letterlike Symbols
		 * Number Forms
		 * Arrows
		 * Mathematical Operators
		 * Miscellaneous Technical
		 * Control Pictures
		 * Optical Character Recognition
		 * Enclosed Alphanumerics
		 * Box Drawing
		 * Block Elements
		 * Geometric Shapes
		 * Miscellaneous Symbols
		 * Dingbats
		 * Miscellaneous Mathematical Symbols-A
		 * Supplemental Arrows-A
		 * Braille Patterns
		 * Supplemental Arrows-B
		 * Miscellaneous Mathematical Symbols-B
		 * Supplemental Mathematical Operators
		 * Miscellaneous Symbols and Arrows
		 */
		'\u2000-\u2BFF',

		// Supplemental Punctuation
		'\u2E00-\u2E7F',
		']',
	].join( '' ), 'g' ),

	// Remove UTF-16 surrogate points, see https://en.wikipedia.org/wiki/UTF-16#U.2BD800_to_U.2BDFFF
	astralRegExp: /[\uD800-\uDBFF][\uDC00-\uDFFF]/g,
	wordsRegExp: /\S\s+/g,
	characters_excluding_spacesRegExp: /\S/g,

	/*
	 * Match anything that is not a formatting character, excluding:
	 * \f = form feed
	 * \n = new line
	 * \r = carriage return
	 * \t = tab
	 * \v = vertical tab
	 * \u00AD = soft hyphen
	 * \u2028 = line separator
	 * \u2029 = paragraph separator
	 */
	characters_including_spacesRegExp: /[^\f\n\r\t\v\u00AD\u2028\u2029]/g,
	l10n: {
		type: 'words',
	},
};
