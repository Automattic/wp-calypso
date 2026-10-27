import { useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import ClipboardInputControl from '../../components/clipboard-input-control';

export default function CertificationCodeField( {
	code,
	label = __( 'Your agency’s discount code' ),
	help = __( 'Each developer can use it once, when buying the exam on Webassessor.' ),
	onCopy,
}: {
	code: string;
	label?: string;
	help?: string;
	/** Replaces the snackbar, for hosts that don't render `@wordpress/notices`. */
	onCopy?: () => void;
} ) {
	const { createSuccessNotice } = useDispatch( noticesStore );

	return (
		<ClipboardInputControl
			label={ label }
			value={ code }
			readOnly
			help={ help }
			onCopy={
				onCopy ??
				( () =>
					createSuccessNotice( __( 'Discount code copied to clipboard.' ), { type: 'snackbar' } ) )
			}
		/>
	);
}
