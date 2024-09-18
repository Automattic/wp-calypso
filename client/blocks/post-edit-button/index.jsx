import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import EditIcon from 'calypso/reader/components/icons/edit-icon';
import { getEditURL } from 'calypso/state/posts/utils';

import './style.scss';

const PostEditButton = ( { post, site, iconSize, onClick, translate } ) => {
	const editUrl = getEditURL( post, site );
	return (
		<a className="post-edit-button" href={ editUrl } onClick={ onClick }>
			<EditIcon width={ iconSize } height={ iconSize } className="post-edit-button__icon" />
			<span className="post-edit-button__label">{ translate( 'Edit' ) }</span>
		</a>
	);
};

PostEditButton.propTypes = {
	post: PropTypes.object.isRequired,
	site: PropTypes.object.isRequired,
	iconSize: PropTypes.number,
	onClick: PropTypes.func,
};

PostEditButton.defaultProps = {
	iconSize: 24,
};

export default localize( PostEditButton );
