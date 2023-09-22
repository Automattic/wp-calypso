import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import ReaderEditIcon from 'calypso/reader/components/icons/edit-button';
import { getEditURL } from 'calypso/state/posts/utils';

import './style.scss';

const PostEditButton = ( { post, site, iconSize, onClick, translate } ) => {
	const editUrl = getEditURL( post, site );
	return (
		<a className="post-edit-button" href={ editUrl } onClick={ onClick }>
			{ ReaderEditIcon( { iconSize } ) }
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
