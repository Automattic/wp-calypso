/**
 * External dependencies
 */
import React from 'react';
import Gridicon from 'gridicons';

const LikeIcons = ( { size } ) => (
	<span className="like-button__like-icons">
		<Gridicon icon="star" size={ size } />
		<Gridicon icon="star-outline" size={ size } />
	</span>
);

LikeIcons.propTypes = {
	size: React.PropTypes.number
};

LikeIcons.defaultProps = {
	size: 24
};

export default LikeIcons;
