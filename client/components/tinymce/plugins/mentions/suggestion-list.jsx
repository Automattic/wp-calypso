/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import PopoverMenu from 'components/popover/menu';
import PopoverMenuItem from 'components/popover/menu-item';
import Suggestion from './suggestion';

const getMatchingSuggestions = function( suggestions, query ) {
	const matcher = new RegExp( '^' + query + '| ' + query, 'ig' ); // Start of string or preceded by a space.
	let matchingSuggestions = suggestions;

	if ( query.length > 0 ) {
		matchingSuggestions = [];

		for ( let i = 0, len = suggestions.length; i < len; i++ ) {
			const suggestion = suggestions[ i ];
			const name = suggestion.name || suggestion.user_login + ' ' + suggestion.display_name;

			if ( name.toLowerCase().match( matcher ) ) {
				matchingSuggestions.push( suggestion );
			}
		}
	}

	return matchingSuggestions.slice( 0, 10 );
};

const SuggestionList = ( { suggestions, query, popoverContext, onClose, onClick } ) => {
	const matchingSuggestions = getMatchingSuggestions( suggestions, query );

	if ( matchingSuggestions.length > 0 ) {
		return (
			<PopoverMenu
				className="mentions__suggestions"
				context={ popoverContext }
				isVisible={ true }
				autoPosition={ false }
				position="bottom"
				onClose={ onClose }>
					{ matchingSuggestions.map( ( suggestion ) => {
						return (
							<PopoverMenuItem
								key={ 'user-suggestion-' + suggestion.ID }
								onClick={ onClick.bind( null, suggestion ) }>
								<Suggestion
									avatarUrl={ suggestion.image_URL }
									username={ suggestion.user_login }
									fullName={ suggestion.display_name }
									query={ query } />
							</PopoverMenuItem>
						);
					} ) }
			</PopoverMenu>
		);
	}

	return null;
};

SuggestionList.propTypes = {
	query: React.PropTypes.string,
	suggestions: React.PropTypes.array,
	onClick: React.PropTypes.func,
	onClose: React.PropTypes.func,
};

SuggestionList.defaultProps = {
	query: '',
	suggestions: [],
};

export default SuggestionList;
