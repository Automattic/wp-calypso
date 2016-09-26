/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Suggestion from './suggestion';
import PopoverMenu from 'components/popover/menu';
import PopoverMenuItem from 'components/popover/menu-item';

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

	onClose: function() {
		this.setState( {
			suggestionsVisible: false
		} );
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
			return (
				<PopoverMenu
					className="suggestions"
					context={ this.refs && this.refs.mention }
					isVisible={ this.state.suggestionsVisible }
					onClose={ this.onClose }>
						{ this.suggestions.map( ( suggestion ) => {
							return (
								<PopoverMenuItem
									key={ 'user-suggestion-' + suggestion.ID }>
									<Suggestion
										ref={ 'suggestion-node-' + suggestion.ID }
										avatarUrl={ suggestion.image_URL }
										username={ suggestion.user_login }
										fullName={ suggestion.display_name }
										suggestionsQuery={ this.state.suggestionsQuery } />
								</PopoverMenuItem>
							);
						} ) }
				</PopoverMenu>
			);
		}

		return null;
	}
};

module.exports = SuggestionsMixin;
