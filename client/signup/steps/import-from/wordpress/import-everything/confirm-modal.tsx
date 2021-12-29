import { Button } from '@automattic/components';
import { NextButton } from '@automattic/onboarding';
import { Modal } from '@wordpress/components';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import classnames from 'classnames';
import * as React from 'react';

interface Props {
	siteSlug: string;
	onConfirm: () => void;
	onClose: () => void;
}

const ConfirmModal: React.FunctionComponent< Props > = ( data ) => {
	const { __ } = useI18n();
	const { siteSlug, onConfirm, onClose } = data;

	return (
		<Modal
			className={ classnames( 'components-modal-new__frame', 'import__confirm-modal' ) }
			title={ __( 'Import and replace everything?' ) }
			onRequestClose={ onClose }
		>
			<p>
				{ sprintf(
					/* translators: the `website` field could be any site URL (eg: "yourname.com") */
					__( 'All posts, pages, comments and media will be lost on %(website)s.' ),
					{ website: siteSlug }
				) }
			</p>
			<div className={ classnames( 'components-modal__button-actions' ) }>
				<Button onClick={ onClose }>{ __( 'Cancel' ) }</Button>
				<NextButton onClick={ onConfirm }>{ __( 'Import and overwrite' ) }</NextButton>
			</div>
		</Modal>
	);
};

export default ConfirmModal;
