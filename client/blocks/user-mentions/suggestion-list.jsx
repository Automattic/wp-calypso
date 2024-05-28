import PropTypes from 'prop-types';
import UserMentionsSuggestion from 'calypso/blocks/user-mentions/suggestion';
import PopoverMenu from 'calypso/components/popover-menu';
import PopoverMenuItem from 'calypso/components/popover-menu/item';

import './suggestion-list.scss';

const defaultContext = {};

const UserMentionsSuggestionList = ( {
	onClick,
	onClose,
	popoverContext = defaultContext,
	popoverPosition = null,
	query = '',
	selectedSuggestionId = 0,
	suggestions,
} ) => (
	<PopoverMenu
		className="user-mentions__suggestions"
		context={ popoverContext }
		isVisible
		focusOnShow={ false }
		autoPosition={ false }
		position="bottom right"
		onClose={ onClose }
		customPosition={ popoverPosition }
	>
		{ suggestions?.map( ( suggestion ) => (
			<PopoverMenuItem
				className="user-mentions__suggestion"
				key={ suggestion.ID }
				isSelected={ suggestion.ID === selectedSuggestionId }
				onClick={ () => onClick?.( suggestion ) }
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

export default UserMentionsSuggestionList;
