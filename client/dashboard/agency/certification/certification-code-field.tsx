import { useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import ClipboardInputControl from '../../components/clipboard-input-control';
import type { CertificationSource } from './constants';
import type { RecordTracksEvent } from '../tiers/types';

export default function CertificationCodeField( {
	code,
	source,
	label = __( 'Your agency’s discount code' ),
	help = __(
		'Enter it when you buy the exam on Webassessor. Up to 20 uses per year, one per developer.'
	),
	onCopy,
	recordTracksEvent,
}: {
	code: string;
	source: CertificationSource;
	label?: string;
	help?: string;
	/** Replaces the snackbar, for hosts that don't render `@wordpress/notices`. */
	onCopy?: () => void;
	recordTracksEvent?: RecordTracksEvent;
} ) {
	const { createSuccessNotice } = useDispatch( noticesStore );

	return (
		<ClipboardInputControl
			label={ label }
			value={ code }
			readOnly
			help={ help }
			onCopy={ () => {
				recordTracksEvent?.( 'calypso_a4a_certification_code_copy', { source } );
				if ( onCopy ) {
					onCopy();
				} else {
					createSuccessNotice( __( 'Discount code copied to clipboard.' ), { type: 'snackbar' } );
				}
			} }
		/>
	);
}
