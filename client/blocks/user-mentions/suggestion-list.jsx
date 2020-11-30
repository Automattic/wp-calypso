/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal dependencies
 */
import PopoverMenu from 'calypso/components/popover/menu';
import PopoverMenuItem from 'calypso/components/popover/menu-item';
import UserMentionsSuggestion from 'calypso/blocks/user-mentions/suggestion';

/**
 * Style dependencies
 */
import './suggestion-list.scss';

const UserMentionsSuggestionList = ( {
	onClick,
	onClose,
	popoverContext,
	popoverPosition,
	query,
	selectedSuggestionId,
	suggestions,
} ) => (
	<PopoverMenu
		className="user-mentions__suggestions"
		context={ popoverContext }
		isVisible={ true }
		isFocusEnabled={ false }
		autoPosition={ false }
		position="bottom right"
		onClose={ onClose }
		customPosition={ popoverPosition }
	>
		{ suggestions.map( ( suggestion ) => (
			<PopoverMenuItem
				className="user-mentions__suggestion"
				key={ suggestion.ID }
				isSelected={ suggestion.ID === selectedSuggestionId }
				onClick={ () => onClick( suggestion ) }
			>
				<UserMentionsSuggestion
					avatarUrl={ suggestion.image_URL }
					username={ suggestion.user_login }
					fullName={ suggestion.display_name }
					query={ query }
				/>
			</PopoverMenuItem>
		) ) }
	</PopoverMenu>
);

UserMentionsSuggestionList.propTypes = {
	onClick: PropTypes.func,
	onClose: PropTypes.func,
	query: PropTypes.string,
	popoverContext: PropTypes.object,
	popoverPosition: PropTypes.shape( {
		top: PropTypes.number,
		left: PropTypes.number,
		positionClass: PropTypes.oneOf( [ 'top', 'right', 'bottom', 'left' ] ),
	} ),
	selectedSuggestionId: PropTypes.number,
	suggestions: PropTypes.array,
};

UserMentionsSuggestionList.defaultProps = {
	onClick: () => {},
	onClose: () => {},
	query: '',
	popoverContext: {},
	popoverPosition: null,
	selectedSuggestionId: 0,
	suggestions: [],
};

export default UserMentionsSuggestionList;
