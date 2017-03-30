/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import Gridicon from 'gridicons';
import { pick } from 'lodash';

/**
 * Internal dependencies
 */
import Dialog from 'components/dialog';
import SharingPreviewPane from 'blocks/sharing-preview-pane';

const SharingPreviewModal = ( props ) => {
	const previewProps = pick( props, [ 'message', 'siteId', 'postId' ] );
	const {
		isVisible,
		onClose,
	} = props;

	return (
		<Dialog isVisible={ isVisible } additionalClassNames="post-share__sharing-preview-modal" >
			<header className="post-share__sharing-preview-modal-header">
				<button onClick={ onClose } className="post-share__sharing-preview-modal-close" >
					<Gridicon icon="cross" />
				</button>
			</header>
			<SharingPreviewPane { ...previewProps } />
		</Dialog>
	);
};

SharingPreviewModal.propTypes = {
	isVisible: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired,

	// SharingPreviewPane props
	siteId: PropTypes.number,
	postId: PropTypes.number,
	message: PropTypes.string,
};

export default SharingPreviewModal;
