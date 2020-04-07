/**
 * External dependencies
 */
import React from 'react';
import { Button } from '@wordpress/components';
import { useI18n } from '@automattic/react-i18n';

interface CloseButtonProps {
	onClose: () => void;
}

const CloseButton = ( { onClose }: CloseButtonProps ) => {
	const { __: NO__ } = useI18n();
	return (
		<Button onClick={ onClose } label={ NO__( 'Close dialog' ) }>
			<svg
				width="12"
				height="12"
				viewBox="0 0 16 16"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path d="M1.40456 1L15 15M1 15L14.5954 1" stroke="#1E1E1E" strokeWidth="1.5" />
			</svg>
		</Button>
	);
};

export default CloseButton;
