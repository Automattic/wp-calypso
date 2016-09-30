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
		if ( ! this.state.suggestionsVisible || this.props.suggestions.length === 0 ) {
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

	onClose: function() {
		this.setState( {
			suggestionsVisible: false
		} );
	},

	renderSuggestions: function() {
		if ( ! this.state.suggestionsVisible ) {
			return;
		}

		const matcher = new RegExp( "^" + this.state.suggestionsQuery + "| " + this.state.suggestionsQuery, 'ig' ); // start of string, or preceded by a space

		let suggestions = this.props.suggestions;

		if ( this.state.suggestionsQuery.length > 0 ) {
			suggestions = [];

			for ( let i = 0, len = this.props.suggestions.length; i < len; i++ ) {
				const suggestion = this.props.suggestions[i];
				const name = suggestion.name || suggestion.user_login + ' ' + suggestion.display_name;

				if ( name.toLowerCase().match( matcher ) ) {
					suggestions.push( suggestion );
				}
			}
		}

		suggestions = suggestions.slice( 0, 10 );

		if ( suggestions.length > 0 ) {
			return (
				<PopoverMenu
					className="suggestions"
					context={ this.refs && this.refs.mention }
					isVisible={ this.state.suggestionsVisible }
					onClose={ this.onClose }>
						{ suggestions.map( ( suggestion ) => {
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
