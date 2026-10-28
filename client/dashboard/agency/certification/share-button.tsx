import { Button } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useState } from 'react';
import CertificationShareModal from './share-modal';
import type { RecordTracksEvent } from '../tiers/types';
import type { CSSProperties } from 'react';

/**
 * Opens the message an owner pastes into a chat or email for their developers.
 * Copying it invites no one and sends nothing.
 */
export default function CertificationShareButton( {
	message,
	source,
	size,
	variant = 'secondary',
	style,
	onClick,
	onCopy,
	recordTracksEvent,
}: {
	message: string;
	/** Where the button sits, sent with the Tracks events. */
	source: 'overview' | 'agency_tier';
	size?: 'compact' | 'default';
	variant?: 'primary' | 'secondary' | 'tertiary';
	style?: CSSProperties;
	onClick?: () => void;
	/** Replaces the snackbar, for hosts that don't render `@wordpress/notices`. */
	onCopy?: () => void;
	recordTracksEvent?: RecordTracksEvent;
} ) {
	const [ isModalOpen, setModalOpen ] = useState( false );
	const [ hasCopyFailed, setCopyFailed ] = useState( false );
	const { createSuccessNotice } = useDispatch( noticesStore );

	const copy = async () => {
		try {
			await navigator.clipboard.writeText( message );
		} catch {
			// The modal stays open with an error, so the message can still be copied by hand.
			setCopyFailed( true );
			recordTracksEvent?.( 'calypso_a4a_certification_share_copy_failed', { source } );
			return;
		}
		recordTracksEvent?.( 'calypso_a4a_certification_share_copy', { source } );
		setModalOpen( false );
		if ( onCopy ) {
			onCopy();
		} else {
			createSuccessNotice( __( 'Message copied. Paste it into a chat or email.' ), {
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
					recordTracksEvent?.( 'calypso_a4a_certification_share_open', { source } );
					setCopyFailed( false );
					setModalOpen( true );
				} }
			>
				{ __( 'Share with your team' ) }
			</Button>
			{ isModalOpen && (
				<CertificationShareModal
					message={ message }
					hasCopyFailed={ hasCopyFailed }
					onCopy={ copy }
					onClose={ () => setModalOpen( false ) }
				/>
			) }
		</>
	);
}
