import { createRef, Component } from 'react';
import { connect } from 'react-redux';
import actions from '../state/actions';
import getSiteSuggestions from '../state/selectors/get-site-suggestions';
import Suggestion from './suggestion';

const KEY_ENTER = 13;
const KEY_ESC = 27;
const KEY_SPACE = 32;
const KEY_UP = 38;
const KEY_DOWN = 40;

/**
 * This pattern looks for a any non-space-character
 * string prefixed with an `@` which either starts
 * at the beginning of a line or after a space
 * @type {RegExp} matches @mentions
 */
const suggestionMatcher = /(?:^|\s)@([^\s]*)$/i;

/**
 * This pattern looks for special regex characters.
 * Extracted directly from lodash@4.17.21.
 */
const reRegExpChars = /[\\^$.*+?()[\]{}|]/g;
const reHasRegExpChars = RegExp( reRegExpChars.source );

/**
 * This pattern looks for a query
 * @type {RegExp} matches @query
 */
const queryMatcher = ( query ) => new RegExp( `^${ query }| ${ query }`, 'i' ); // start of string, or preceded by a space

// Danger! Recursive
// (relatively safe since the DOM tree is only so deep)
const getOffsetTop = ( element ) => {
	const offset = element.offsetTop;

	return element.offsetParent ? offset + getOffsetTop( element.offsetParent ) : offset;
};

const getSuggestionIndexBySelectedId = function ( suggestions ) {
	if ( ! this.state.selectedSuggestionId ) {
		return 0;
	}

	const index = suggestions.findIndex( ( { ID } ) => ID === this.state.selectedSuggestionId );

	return index > -1 ? index : null;
};

class Suggestions extends Component {
	suggestionList = createRef();
	suggestionNodes = {};
	state = {};

	componentDidMount() {
		window.addEventListener( 'keydown', this.handleSuggestionsKeyDown, false );
		window.addEventListener( 'keyup', this.handleSuggestionsKeyUp, false );
		window.addEventListener( 'blur', this.handleSuggestionBlur, true );

		this.props.fetchSuggestions( this.props.site );
	}

	componentWillUnmount() {
		window.removeEventListener( 'keydown', this.handleSuggestionsKeyDown, false );
		window.removeEventListener( 'keyup', this.handleSuggestionsKeyUp, false );
		window.removeEventListener( 'blur', this.handleSuggestionBlur, true );
	}

	componentDidUpdate() {
		if ( ! this.suggestionList.current ) {
			return;
		}

		const suggestionList = this.suggestionList.current;

		if ( ! this.suggestionListMarginTop ) {
			this.suggestionListMarginTop = window.getComputedStyle( suggestionList )[ 'margin-top' ];
		}

		const textArea = this.props.getContextEl();
		const textAreaClientRect = textArea.getBoundingClientRect();

		this.suggestionsAbove =
			suggestionList.offsetHeight > window.innerHeight - textAreaClientRect.top &&
			suggestionList.offsetHeight < textAreaClientRect.top;

		if ( this.suggestionsAbove ) {
			suggestionList.style.top =
				'-' +
				( suggestionList.offsetHeight +
					textAreaClientRect.height +
					parseInt( this.suggestionListMarginTop ) ) +
				'px';
			suggestionList.style.marginTop = '0';
		}
	}

	stopEvent( event ) {
		if ( this.state.suggestionsVisible ) {
			event.stopPropagation();
			event.preventDefault();
		}
	}

	getQueryText( element ) {
		if ( ! element.value ) {
			return null;
		}

		const textBeforeCaret = element.value.slice( 0, element.selectionStart );

		const match = suggestionMatcher.exec( textBeforeCaret );

		if ( ! match ) {
			return null;
		}

		const [ , suggestion ] = match;

		// NOTE: This test logic was extracted directly from lodash@4.17.21.
		if ( suggestion && reHasRegExpChars.test( suggestion ) ) {
			return suggestion.replace( reRegExpChars, '\\$&' );
		}

		return suggestion;
	}

	handleSuggestionsKeyDown = ( event ) => {
		if ( ! this.state.suggestionsVisible || this.props.suggestions.length === 0 ) {
			return;
		}

		if ( KEY_ENTER === event.keyCode ) {
			this.stopEvent( event );
			return;
		}

		if ( KEY_UP !== event.keyCode && KEY_DOWN !== event.keyCode ) {
			return;
		}

		this.stopEvent( event );

		const { suggestions } = this.state;
		const prevIndex = getSuggestionIndexBySelectedId.call( this, suggestions );

		if ( null === prevIndex ) {
			return;
		}

		const direction = {
			[ KEY_UP ]: -1,
			[ KEY_DOWN ]: 1,
		}[ event.keyCode ];

		this.setState(
			{
				selectedSuggestionId:
					suggestions[ ( prevIndex + direction + suggestions.length ) % suggestions.length ].ID,
			},
			this.ensureSelectedSuggestionVisibility
		);
	};

	getSuggestionById() {
		if ( ! this.state.selectedSuggestionId && this.props.suggestions.length > 0 ) {
			return this.props.suggestions[ 0 ];
		}

		return (
			this.props.suggestions.find( ( { ID } ) => ID === this.state.selectedSuggestionId ) || null
		);
	}

	handleSuggestionsKeyUp = ( { keyCode, target } ) => {
		if ( KEY_ENTER === keyCode ) {
			if ( ! this.state.suggestionsVisible || this.props.suggestions.length === 0 ) {
				return;
			}

			this.props.onInsertSuggestion( this.getSuggestionById(), this.state.suggestionsQuery );
			return this.setState( { suggestionsVisible: false } );
		}

		if ( KEY_ESC === keyCode || KEY_SPACE === keyCode ) {
			return this.setState( { suggestionsVisible: false } );
		}

		if ( KEY_UP === keyCode || KEY_DOWN === keyCode ) {
			return;
		}

		const query = this.getQueryText( target );
		const matcher = queryMatcher( query );
		const suggestions = this.props.suggestions
			.filter( ( { name } ) => matcher.test( name ) )
			.slice( 0, 10 );

		this.setState( {
			suggestionsQuery: query,
			suggestionsVisible: typeof query === 'string',
			selectedSuggestionId: suggestions.length > 0 ? suggestions[ 0 ].ID : null,
			suggestions,
		} );
	};

	handleSuggestionClick = ( suggestion ) => {
		this.props.onInsertSuggestion( suggestion, this.state.suggestionsQuery );
		this.setState( { suggestionsVisible: false } );
	};

	handleSuggestionBlur = () => {
		if ( this.suggestionsCancelBlur ) {
			return;
		}

		this.setState( { suggestionsVisible: false } );
	};

	ensureSelectedSuggestionVisibility = () => {
		if ( this.suggestionsAbove ) {
			return;
		}

		const suggestionElement = this.suggestionNodes[ this.state.selectedSuggestionId ];

		if ( ! suggestionElement ) {
			return;
		}

		const offsetTop = getOffsetTop( suggestionElement ) + suggestionElement.offsetHeight;

		if ( offsetTop > window.innerHeight ) {
			suggestionElement.scrollIntoView();
		}
	};

	render() {
		const { suggestions, suggestionsVisible, selectedSuggestionId } = this.state;

		if ( ! suggestionsVisible || ! suggestions.length ) {
			return null;
		}

		return (
			<div
				className="wpnc__suggestions"
				ref={ this.suggestionList }
				onMouseEnter={ () => ( this.suggestionsCancelBlur = true ) }
				onMouseLeave={ () => ( this.suggestionsCancelBlur = false ) }
			>
				<ul>
					{ suggestions.map( ( suggestion ) => (
						<Suggestion
							key={ 'user-suggestion-' + suggestion.ID }
							getElement={ ( suggestionElement ) => {
								this.suggestionNodes[ suggestion.ID ] = suggestionElement;
							} }
							onClick={ () => this.handleSuggestionClick( suggestion ) }
							onMouseEnter={ () => {
								this.setState( { selectedSuggestionId: suggestion.ID } );
							} }
							avatarUrl={ suggestion.image_URL }
							username={ suggestion.user_login }
							fullName={ suggestion.display_name }
							selected={ suggestion.ID === selectedSuggestionId }
							suggestionsQuery={ this.state.suggestionsQuery }
						/>
					) ) }
				</ul>
			</div>
		);
	}
}

export default connect(
	( state, { site } ) => ( {
		suggestions: getSiteSuggestions( state, site ),
	} ),
	{
		fetchSuggestions: actions.suggestions.fetchSuggestions,
	}
)( Suggestions );
