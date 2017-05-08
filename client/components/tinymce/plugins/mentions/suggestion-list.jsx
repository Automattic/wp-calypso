/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { bind } from 'lodash';

/**
 * Internal dependencies
 */
import PopoverMenu from 'components/popover/menu';
import PopoverMenuItem from 'components/popover/menu-item';
import Suggestion from './suggestion';

const SuggestionList = ( { onClick, onClose, popoverContext, query, selectedSuggestionId, suggestions } ) =>
	<PopoverMenu
		className="mentions__suggestions"
		context={ popoverContext }
		isVisible={ true }
		autoPosition={ false }
		position="bottom right"
		onClose={ onClose }>
			{ suggestions.map( ( suggestion ) => (
				<PopoverMenuItem
					className="mentions__suggestion"
					key={ suggestion.ID }
					isSelected={ suggestion.ID === selectedSuggestionId }
					onClick={ bind( onClick, null, suggestion ) }>
					<Suggestion
						avatarUrl={ suggestion.image_URL }
						username={ suggestion.user_login }
						fullName={ suggestion.display_name }
						query={ query } />
				</PopoverMenuItem>
			) ) }
	</PopoverMenu>;

SuggestionList.propTypes = {
	onClick: PropTypes.func,
	onClose: PropTypes.func,
	query: PropTypes.string,
	popoverContext: PropTypes.object,
	selectedSuggestionId: PropTypes.number,
	suggestions: PropTypes.array,
};

SuggestionList.defaultProps = {
	onClick: () => {},
	onClose: () => {},
	query: '',
	popoverContext: {},
	selectedSuggestionId: 0,
	suggestions: [],
};

export default SuggestionList;
