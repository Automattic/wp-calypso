import { getSuggestionClickContext } from '../get-suggestion-click-context';

const footer = [ { id: 'translate', label: 'Translate', prompt: 'Translate this' } ];
const list = [ { id: 'customize-colors', label: 'Customize colors', prompt: 'Show me palettes' } ];

describe( 'getSuggestionClickContext', () => {
	it.each( [
		[ 'a footer chip', footer[ 0 ], true, footer, false ],
		[ 'a typed prompt', 'Translate this', true, footer, false ],
		[ 'an empty-view chip', list[ 0 ], false, list, false ],
		[ 'a chip in a message', list[ 0 ], true, list, true ],
	] )(
		'reports %s with its own list',
		( _source, selectedSuggestion, hasMessages, knownSuggestions, isInMessage ) => {
			expect(
				getSuggestionClickContext( {
					selectedSuggestion,
					availableSuggestions: list,
					footerSuggestions: footer,
					hasMessages,
				} )
			).toEqual( { knownSuggestions, isInMessage } );
		}
	);
} );
