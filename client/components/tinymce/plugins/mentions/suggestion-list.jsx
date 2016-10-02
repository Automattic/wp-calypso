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

const SuggestionList = React.createClass( {
	displayName: 'SuggestionList',

	propTypes: {
		query: React.PropTypes.string,
		suggestions: React.PropTypes.array,
		isVisible: React.PropTypes.bool,
		onClick: React.PropTypes.func,
		onClose: React.PropTypes.func
	},

	getDefaultProps() {
		return {
			query: '',
			suggestions: [],
			isVisible: false
		};
	},

	getMatchingSuggestions() {
		const { suggestions, query } = this.props;
		const matcher = new RegExp( "^" + query + "| " + query, 'ig' ); // Start of string or preceded by a space.
		let matchingSuggestions = suggestions;

		if ( query.length > 0 ) {
			matchingSuggestions = [];

			for ( let i = 0, len = suggestions.length; i < len; i++ ) {
				const suggestion = suggestions[i];
				const name = suggestion.name || suggestion.user_login + ' ' + suggestion.display_name;

				if ( name.toLowerCase().match( matcher ) ) {
					matchingSuggestions.push( suggestion );
				}
			}
		}

		return matchingSuggestions.slice( 0, 10 );
	},

	render() {
		if ( ! this.props.isVisible || ! this.props.suggestions ) {
			return null;
		}

		const suggestions = this.getMatchingSuggestions();

		if ( suggestions.length > 0 ) {
			return (
				<div ref="mention">
					<PopoverMenu
						className="suggestions"
						context={ this.refs && this.refs.mention }
						isVisible={ this.props.isVisible }
						onClose={ this.props.onClose }>
							{ suggestions.map( ( suggestion ) => {
								return (
									<PopoverMenuItem
										key={ 'user-suggestion-' + suggestion.ID }>
										<Suggestion
											ref={ 'suggestion-node-' + suggestion.ID }
											avatarUrl={ suggestion.image_URL }
											username={ suggestion.user_login }
											fullName={ suggestion.display_name }
											query={ this.props.query } />
									</PopoverMenuItem>
								);
							} ) }
					</PopoverMenu>
				</div>
			);
		}

		return null;
	}
} );

export default SuggestionList;
