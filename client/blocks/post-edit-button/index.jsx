import { Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { getEditURL } from 'calypso/state/posts/utils';

import './style.scss';

const PostEditButton = ( { post, site, iconSize = 24, onClick } ) => {
	const translate = useTranslate();
	const editUrl = getEditURL( post, site );

	return (
		<a
			className="post-edit-button tooltip"
			href={ editUrl }
			onClick={ onClick }
			data-tooltip={ translate( 'Edit post' ) }
		>
			<Gridicon icon="pencil" size={ iconSize } className="post-edit-button__icon" />
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

export default PostEditButton;
