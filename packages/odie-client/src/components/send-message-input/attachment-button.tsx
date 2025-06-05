import { FormFileUpload, Spinner } from '@wordpress/components';
import { Icon, image } from '@wordpress/icons';
import React from 'react';

export const AttachmentButton: React.FC< {
	attachmentButtonRef?: React.RefObject< HTMLElement >;
	onFileUpload: ( file: File ) => void;
	isAttachingFile: boolean;
} > = ( { attachmentButtonRef, onFileUpload, isAttachingFile } ) => {
	return (
		<FormFileUpload
			accept="image/*"
			onChange={ ( event ) => {
				const file = event?.currentTarget?.files?.[ 0 ];
				if ( file ) {
					onFileUpload( file );
				}
			} }
			disabled={ isAttachingFile }
		>
			{ isAttachingFile && <Spinner style={ { margin: 0 } } /> }
			{ ! isAttachingFile && <Icon ref={ attachmentButtonRef } icon={ image } /> }
		</FormFileUpload>
	);
};
