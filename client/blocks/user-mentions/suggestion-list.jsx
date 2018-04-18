/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { bind, noop } from 'lodash';

/**
 * Internal dependencies
 */
import PopoverMenu from 'components/popover/menu';
import PopoverMenuItem from 'components/popover/menu-item';
import UserMentionSuggestion from './suggestion';

class UserMentionSuggestionList extends Component {
	render() {
		const {
			onClick,
			onClose,
			popoverContext,
			query,
			selectedSuggestionId,
			suggestions,
		} = this.props;
		return (
			<PopoverMenu
				className="user-mentions__suggestions"
				context={ popoverContext }
				isVisible={ true }
				autoPosition={ false }
				position="bottom right"
				onClose={ onClose }
				popoverPositionLeft={ this.props.popoverPositionLeft }
				popoverPositionTop={ this.props.popoverPositionTop }
			>
				{ suggestions.map( suggestion => (
					<PopoverMenuItem
						className="user-mentions__suggestion"
						key={ suggestion.ID }
						isSelected={ suggestion.ID === selectedSuggestionId }
						onClick={ bind( onClick, null, suggestion ) }
					>
						<UserMentionSuggestion
							avatarUrl={ suggestion.image_URL }
							username={ suggestion.user_login }
							fullName={ suggestion.display_name }
							query={ query }
						/>
					</PopoverMenuItem>
				) ) }
			</PopoverMenu>
		);
	}
}

UserMentionSuggestionList.propTypes = {
	onClick: PropTypes.func,
	onClose: PropTypes.func,
	query: PropTypes.string,
	popoverContext: PropTypes.object,
	selectedSuggestionId: PropTypes.number,
	suggestions: PropTypes.array,
};

UserMentionSuggestionList.defaultProps = {
	onClick: noop,
	onClose: noop,
	query: '',
	popoverContext: null,
	selectedSuggestionId: 0,
	suggestions: [],
};

export default UserMentionSuggestionList;
