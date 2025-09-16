import { animations } from '@automattic/agenttic-ui';
import { Button } from '@wordpress/components';
import { cancelCircleFilled, Icon } from '@wordpress/icons';
import clsx from 'clsx';
import { motion, Transition } from 'framer-motion';
import './style.scss';

export const AttachmentPreview = ( {
	attachmentPreview,
	onCancel,
	isAttachingFile = true,
}: {
	attachmentPreview: File;
	onCancel: () => void;
	isAttachingFile: boolean;
} ) => {
	const fileType = attachmentPreview.type.split( '/' ).pop();

	return (
		<motion.div
			initial={ { opacity: 0, scale: 1 } }
			animate={ { opacity: 1, scale: 1 } }
			transition={ { ...animations.fastSpring } as Transition }
			className={ clsx( 'odie-attachment-preview', { 'is-attaching-file': isAttachingFile } ) }
		>
			<img src={ URL.createObjectURL( attachmentPreview ) } alt={ attachmentPreview.name } />
			<div>
				<p className="odie-attachment-preview-name">{ attachmentPreview.name }</p>
				{ fileType && (
					<p className="odie-attachment-preview-file-type">{ fileType.toUpperCase() }</p>
				) }
			</div>
			<Button className="odie-attachment-preview-cancel" onClick={ onCancel }>
				<Icon icon={ cancelCircleFilled } />
			</Button>
		</motion.div>
	);
};

export const AttachmentPreviews = ( {
	attachmentPreviews,
	onCancel,
	isAttachingFile,
}: {
	attachmentPreviews: File[];
	onCancel: ( index: number ) => void;
	isAttachingFile: boolean;
} ) => {
	return (
		<div className="odie-attachment-previews">
			{ attachmentPreviews.map( ( preview, index ) => (
				<AttachmentPreview
					key={ preview.name + preview.lastModified }
					attachmentPreview={ preview }
					isAttachingFile={ isAttachingFile }
					onCancel={ () => onCancel( index ) }
				/>
			) ) }
		</div>
	);
};
