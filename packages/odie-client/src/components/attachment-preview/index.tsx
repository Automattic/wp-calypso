import { ArrowUpIcon } from '@automattic/agenttic-ui';
import { Button } from '@wordpress/components';
import { cancelCircleFilled } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import clsx from 'clsx';
import './style.scss';

export const AttachmentPreview = ( {
	attachmentPreview,
	onSend,
	onCancel,
	isAttachingFile,
}: {
	attachmentPreview: File;
	onSend: () => void;
	onCancel: () => void;
	isAttachingFile: boolean;
} ) => {
	const { __ } = useI18n();

	return (
		<div className={ clsx( 'odie-attachment-preview', { 'is-attaching-file': isAttachingFile } ) }>
			<img src={ URL.createObjectURL( attachmentPreview ) } alt={ attachmentPreview.name } />
			<Button
				className="odie-attachment-send-button"
				icon={ ArrowUpIcon }
				variant="primary"
				aria-label={ __( 'Send attachment', __i18n_text_domain__ ) }
				onClick={ onSend }
				isBusy={ isAttachingFile }
				disabled={ isAttachingFile }
			/>
			<Button
				icon={ cancelCircleFilled }
				variant="tertiary"
				isDestructive
				aria-label={ __( 'Cancel attachment', __i18n_text_domain__ ) }
				disabled={ isAttachingFile }
				onClick={ onCancel }
			/>
		</div>
	);
};
