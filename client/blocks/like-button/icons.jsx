/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import GridiconStarOutline from 'gridicons/dist/star-outline';
import GridiconStar from 'gridicons/dist/star';

const LikeIcons = ( { size } ) => (
	<span className="like-button__like-icons">
		<GridiconStar size={ size } />
		<GridiconStarOutline size={ size } />
	</span>
);

LikeIcons.propTypes = {
	size: PropTypes.number,
};

LikeIcons.defaultProps = {
	size: 24,
};

export default LikeIcons;
