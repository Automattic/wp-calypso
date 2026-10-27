import { Button } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useState } from 'react';
import CertificationShareModal from './share-modal';
import type { CSSProperties } from 'react';

/**
 * Opens the message an owner pastes into Slack or email for their developers.
 * Copying it invites no one and sends nothing.
 */
export default function CertificationShareButton( {
	message,
	size,
	variant = 'secondary',
	style,
	onClick,
	onCopy,
}: {
	message: string;
	size?: 'compact' | 'default';
	variant?: 'primary' | 'secondary' | 'tertiary';
	style?: CSSProperties;
	onClick?: () => void;
	/** Replaces the snackbar, for hosts that don't render `@wordpress/notices`. */
	onCopy?: () => void;
} ) {
	const [ isModalOpen, setModalOpen ] = useState( false );
	const { createSuccessNotice } = useDispatch( noticesStore );

	const copy = async () => {
		try {
			await navigator.clipboard.writeText( message );
		} catch {
			// The modal stays open, so the message can still be selected and copied by hand.
			return;
		}
		setModalOpen( false );
		if ( onCopy ) {
			onCopy();
		} else {
			createSuccessNotice( __( 'Message copied. Paste it into Slack or email.' ), {
				type: 'snackbar',
			} );
		}
	};

	return (
		<>
			<Button
				__next40pxDefaultSize
				size={ size }
				variant={ variant }
				style={ style }
				onClick={ () => {
					onClick?.();
					setModalOpen( true );
				} }
			>
				{ __( 'Share with your team' ) }
			</Button>
			{ isModalOpen && (
				<CertificationShareModal
					message={ message }
					onCopy={ copy }
					onClose={ () => setModalOpen( false ) }
				/>
			) }
		</>
	);
}
