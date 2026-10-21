import { Gridicon } from '@automattic/components';
import PropTypes from 'prop-types';

const LikeIcons = ( { size = 24 } ) => (
	<span className="like-button__like-icons">
		<Gridicon icon="star" size={ size } />
		<Gridicon icon="star-outline" size={ size } />
	</span>
);

LikeIcons.propTypes = {
	size: PropTypes.number,
};

export default LikeIcons;
