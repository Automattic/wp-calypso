module.exports = {
	specialTokens: {
		textEscaped: [ 'a   b', 'i &lt;3 tags', '1&amp;2&amp;3&amp;4' ],
		htmlEscaped: [ 'a&nbsp;&nbsp;&nbsp;b', 'i&nbsp;&lt;3&nbsp;tags', '1&amp;2&amp;3&amp;4' ],
		textUnescaped: [ 'a   b', 'i <3 tags', '1&2&3&4' ],
		htmlUnescaped: [ 'a&nbsp;&nbsp;&nbsp;b', 'i&nbsp;&lt;3&nbsp;tags', '1&amp;2&amp;3&amp;4' ]
	},
	specialSuggestions: {
		textEscaped: [ '&lt;3', 'Stuff &amp; Things', 'Tags &amp; Stuff', 'Tags &amp; Stuff 2' ],
		htmlEscaped: [ '&lt;3', 'Stuff&nbsp;&amp;&nbsp;Things', 'Tags&nbsp;&amp;&nbsp;Stuff', 'Tags&nbsp;&amp;&nbsp;Stuff&nbsp;2' ],
		textUnescaped: [ '<3', 'Stuff & Things', 'Tags & Stuff', 'Tags & Stuff 2' ],
		htmlUnescaped: [ '&lt;3', 'Stuff&nbsp;&amp;&nbsp;Things', 'Tags&nbsp;&amp;&nbsp;Stuff', 'Tags&nbsp;&amp;&nbsp;Stuff&nbsp;2' ],
		matchAmpersandUnescaped: [
			[ 'Stuff ', '&', ' Things' ],
			[ 'Tags ', '&', ' Stuff' ],
			[ 'Tags ', '&', ' Stuff 2' ]
		],
		matchAmpersandSequence: [
			[ 'Tag', 's &', ' Stuff' ],
			[ 'Tag', 's &', ' Stuff 2' ]
		],
		matchAmpersandEscaped: []
	},
	matchingSuggestions: {
		t: [
			[ 't', 'he' ],
			[ 't', 'o' ],
			[ 't', 'hat' ],
			[ 't', 'his' ],
			[ 'wi', 't', 'h' ],
			[ 'i', 't' ],
			[ 'no', 't' ],
			[ 'a', 't' ]
		],
		s: [
			[ 's', 'nake' ],
			[ 's', 'ound' ],
			[ 'i', 's' ],
			[ 'thi', 's' ],
			[ 'a', 's' ],
			[ 'wa', 's' ],
			[ 'pipe', 's']
		],
		at: [
			[ 'at' ],
			[ 'th', 'at' ]
		]
	}
};
