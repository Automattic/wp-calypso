/** @format */
/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { noop, map, size, takeRight, filter, uniqBy } from 'lodash';

/**
 * Internal dependencies
 */
import Gravatar from 'components/gravatar';
import Count from 'components/count';

class GravatarCaterpillar extends React.Component {
	static propTypes = {
		onClick: PropTypes.func,
		showCount: PropTypes.bool,
	};

	render() {
		const { users, onClick, maxGravatarsToDisplay, showCount, gravatarSize } = this.props;

		if ( size( users ) < 1 ) {
			return null;
		}

		const gravatarSmallScreenThreshold = maxGravatarsToDisplay / 2;

		// Only display authors with a gravatar, and only display each author once
		const displayedUsers = takeRight(
			filter( uniqBy( users, 'avatar_URL' ), 'avatar_URL' ),
			maxGravatarsToDisplay
		);
		const displayedUsersCount = size( displayedUsers );
		const allUsersCount = size( users );
		const usersNotDisplayedCount = allUsersCount - displayedUsersCount;

		return (
			<div className="gravatar-caterpillar" onClick={ onClick } aria-hidden="true">
				{ map( displayedUsers, ( user, index ) => {
					let gravClasses = 'gravatar-caterpillar__gravatar';
					// If we have more than x gravs,
					// add a additional class so we can hide some on small screens
					if (
						displayedUsersCount > gravatarSmallScreenThreshold &&
						index < displayedUsersCount - gravatarSmallScreenThreshold
					) {
						gravClasses += ' is-hidden-on-small-screens';
					}

					return (
						<Gravatar
							className={ gravClasses }
							key={ user.avatar_URL }
							user={ user }
							size={ gravatarSize }
						/>
					);
				} ) }
				{ // @todo handle the increased count for small screens, because fewer avatars are displayed
				showCount &&
					usersNotDisplayedCount > 0 && (
						<Count
							count={ `${ usersNotDisplayedCount }+` }
							className="gravatar-caterpillar__count"
						/>
					) }
			</div>
		);
	}
}

GravatarCaterpillar.defaultProps = {
	onClick: noop,
	maxGravatarsToDisplay: 10,
	showCount: false,
	gravatarSize: 32,
};

export default GravatarCaterpillar;
