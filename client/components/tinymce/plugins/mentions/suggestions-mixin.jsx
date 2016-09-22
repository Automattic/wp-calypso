/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Suggestion from './suggestion';

const stopEvent = function( event ) {
	if ( this.state.suggestionsVisible ) {
		event.stopPropagation();
		event.preventDefault();
	}
};

const SuggestionsMixin = {
	componentWillMount: function() {
		this.suggestions = [];
		this.suggestionsAbove = false;
	},

	componentDidMount: function() {
		this.isMounted = true;
	},

	componentWillUnmount: function() {
		this.isMounted = false;
	},

	fetchSuggestions: function() {
		const client = this.props.client,
			siteId = this.props.siteId || null,
			key = 'suggestions-' + siteId;

		if ( ! client.suggestions || ! client.suggestions[ key ] ) {
			client.getUsersSuggestions( siteId );
		}
	},

	getQueryText: function( value ) {
		if ( ! value ) {
			return null;
		}

		const matcher = new RegExp( '(?:^|\\s)@([A-Za-z0-9_\+\-]*)$|(?:^|\\s)@([^\\x00-\\xff]*)$', 'gi' ),
			match = matcher.exec( value );

		if ( match ) {
			return match[ 2 ] || match[ 1 ];
		}

		return null;
	},

	handleSuggestionsKeyDown: function( event ) {
		if ( ! this.state.suggestionsVisible || this.suggestions.length === 0 ) {
			return;
		}

		switch ( event.keyCode ) {
			case 13: //enter
				stopEvent.call( this, event );
				break;
			case 38: //up arrow
				stopEvent.call( this, event );
				break;
			case 40: //down arrow
				stopEvent.call( this, event );
				break;
		}
	},

	handleSuggestionsKeyUp: function( event, element, value ) {
		let newState = null;

		switch ( event.keyCode ) {
			case 13: //enter
			case 27: //esc
			case 32: //space
				newState = {
					suggestionsVisible: false
				};
				break;
			case 38:  //up arrow
			case 40:  //down arrow
				break;
			default:
				const query = this.getQueryText( value );

				if ( query !== null ) {
					this.fetchSuggestions();
				}

				newState = {
					suggestionsQuery: query,
					suggestionsVisible: typeof query === 'string',
					selectedSuggestionId: null
				};

				break;
		}

		if ( newState ) {
			this.setState( newState );
		}
	},

	handleSuggestionBlur: function() {
		if ( ! this.suggestionsCancelBlur && this.isMounted ) {
			this.setState( {
				suggestionsVisible: false
			} );
		}
	},

	ensureSelectedSuggestionVisibility: function() {
		const getOffsetTop = function( element ) {
			let offset = element.offsetTop;

			if( element.offsetParent ) {
				offset += getOffsetTop( element.offsetParent );
			}

			return offset;
		};

		const suggestionElement = this.refs[ 'suggestion-node-' + this.state.selectedSuggestionId ],
			offsetTop = getOffsetTop( suggestionElement );
		let scrollTarget = null;

		if( offsetTop - window.pageYOffset <= 0 ) {
			scrollTarget = offsetTop;
		} else if ( window.pageYOffset + window.innerHeight <= offsetTop ) {
			scrollTarget = offsetTop + suggestionElement.offsetHeight;
		}

		if ( scrollTarget !== null ) {
			window.scrollTo( 0, scrollTarget );
		}
	},

	renderSuggestions: function() {
		if ( ! this.state.suggestionsVisible ) {
			return;
		}

		const siteId = this.props.siteId || null,
			key = 'suggestions-' + siteId,
			client = this.props.client;

		if ( client.suggestions && client.suggestions[ key ] ) {
			this.suggestions = client.suggestions[ key ];
		}

		const matcher = new RegExp( "^" + this.state.suggestionsQuery + "| " + this.state.suggestionsQuery, 'ig' ); // start of string, or preceded by a space

		let suggestions = this.suggestions;

		if ( this.state.suggestionsQuery.length > 0 ) {
			suggestions = [];

			for ( let i = 0, len = this.suggestions.length; i < len; i++ ) {
				const item = this.suggestions[i];

				if ( item['name'].toLowerCase().match( matcher ) ) {
					suggestions.push( item );
				}
			}
		}

		this.suggestions = suggestions.slice( 0, 10 );

		if ( this.suggestions.length > 0 ) {
			const selectedSuggestionId = this.state.selectedSuggestionId || this.suggestions[0].ID;
			const items = this.suggestions.map( function( suggestion ) {
				return <Suggestion
					ref={ 'suggestion-node-' + suggestion.ID }
					key={ 'user-suggestion-' + suggestion.ID }
					onMouseEnter={
						function(suggestion) { this.setState( { selectedSuggestionId: suggestion.ID } ); }.bind( this, suggestion )
					}
					avatarUrl={ suggestion.image_URL }
					username={ suggestion.user_login }
					fullName={ suggestion.display_name }
					selected={ suggestion.ID === selectedSuggestionId }
					suggestionsQuery={ this.state.suggestionsQuery } />
			}.bind( this ) );

			return (
				<div ref="suggestionList" className="suggestions"
					onMouseEnter={function(){ this.suggestionsCancelBlur = true; }.bind( this )}
					onMouseLeave={function(){ this.suggestionsCancelBlur = false; }.bind( this )}>
					<ul>
						{items}
					</ul>
				</div>
			);
		}

		return null;
	}
};

module.exports = SuggestionsMixin;
