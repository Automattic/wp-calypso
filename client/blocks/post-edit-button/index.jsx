import { Gridicon, Tooltip } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { useRef, useState } from 'react';
import { getEditURL } from 'calypso/state/posts/utils';

import './style.scss';

const PostEditButton = ( { post, site, iconSize = 24, onClick } ) => {
	const translate = useTranslate();
	const editUrl = getEditURL( post, site );
	const buttonRef = useRef( null );
	const [ isTooltipVisible, setIsTooltipVisible ] = useState( false );

	return (
		<>
			<a
				className="post-edit-button"
				href={ editUrl }
				onClick={ onClick }
				ref={ buttonRef }
				onMouseEnter={ () => setIsTooltipVisible( true ) }
				onMouseLeave={ () => setIsTooltipVisible( false ) }
				onMouseDown={ () => setIsTooltipVisible( false ) }
			>
				<Gridicon icon="pencil" size={ iconSize } className="post-edit-button__icon" />
				<span className="post-edit-button__label">{ translate( 'Edit post' ) }</span>
			</a>
			<Tooltip
				context={ buttonRef.current }
				isVisible={ isTooltipVisible }
				position="bottom"
				showOnMobile
			>
				{ translate( 'Edit post' ) }
			</Tooltip>
		</>
	);
};

PostEditButton.propTypes = {
	post: PropTypes.object.isRequired,
	site: PropTypes.object.isRequired,
	iconSize: PropTypes.number,
	onClick: PropTypes.func,
};

export default PostEditButton;
