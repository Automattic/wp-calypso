export default {
	specialTokens: {
		textEscaped: [ 'a   b', 'i &lt;3 tags', '1&amp;2&amp;3&amp;4' ],
		htmlEscaped: [ 'a&nbsp;&nbsp;&nbsp;b', 'i&nbsp;&lt;3&nbsp;tags', '1&amp;2&amp;3&amp;4' ],
		textUnescaped: [ 'a   b', 'i <3 tags', '1&2&3&4' ],
		htmlUnescaped: [ 'a&nbsp;&nbsp;&nbsp;b', 'i&nbsp;&lt;3&nbsp;tags', '1&amp;2&amp;3&amp;4' ],
	},
	specialSuggestions: {
		textEscaped: [ '&lt;3', 'Stuff &amp; Things', 'Tags &amp; Stuff', 'Tags &amp; Stuff 2' ],
		textUnescaped: [ '<3', 'Stuff & Things', 'Tags & Stuff', 'Tags & Stuff 2' ],
		matchAmpersandUnescaped: [
			[ 'Tags ', '& S', 'tuff' ],
			[ 'Tags ', '& S', 'tuff 2' ],
		],
		matchAmpersandSequence: [
			[ 'Tag', 's &', ' Stuff' ],
			[ 'Tag', 's &', ' Stuff 2' ],
		],
		matchAmpersandEscaped: [],
	},
	matchingSuggestions: {
		th: [
			[ 'th', 'e' ],
			[ 'th', 'at' ],
			[ 'th', 'is' ],
			[ 'wi', 'th' ],
		],
		so: [
			[ 'so', 'und' ],
			[ 'as', 'so', 'ciate' ],
		],
		at: [
			[ 'at' ],
			[ 'th', 'at' ],
			[ 'associ', 'at', 'e' ],
		],
	},
};
