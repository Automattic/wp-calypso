/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import Gridicon from 'gridicons';
import { omit, noop } from 'lodash';

/**
 * Internal dependencies
 */
import Dialog from 'components/dialog';

const PreviewModal = ( props ) => {
	const {
		onClose,
		toolbar,
		children,
	} = props;

	const dialogProps = omit( props, [ 'toolbar', 'onClose' ] );

	return (
		<Dialog { ...dialogProps } >
			<header className="preview-modal__header">
				<button onClick={ onClose } className="preview-modal__close-button">
					<Gridicon icon="cross" />
				</button>
				{ toolbar }
			</header>
			{ children }
		</Dialog>
	);
};

PreviewModal.propTypes = {
	onClose: PropTypes.func,
	toolbar: PropTypes.element,
};

PreviewModal.defaultProps = {
	onClose: noop,
};

export default PreviewModal;

