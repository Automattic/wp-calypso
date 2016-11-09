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

const SuggestionList = ( { suggestions, query, popoverContext, onClose, onClick } ) =>
	<PopoverMenu
		className="mentions__suggestions"
		context={ popoverContext }
		isVisible={ true }
		autoPosition={ false }
		position="bottom"
		onClose={ onClose }>
			{ suggestions.map( ( suggestion ) => (
				<PopoverMenuItem
					className="mentions__suggestion"
					key={ suggestion.ID }
					onClick={ onClick.bind( null, suggestion ) }>
					<Suggestion
						avatarUrl={ suggestion.image_URL }
						username={ suggestion.user_login }
						fullName={ suggestion.display_name }
						query={ query } />
				</PopoverMenuItem>
			) ) }
	</PopoverMenu>;

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
