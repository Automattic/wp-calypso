import { useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import ClipboardInputControl from '../../components/clipboard-input-control';

export default function CertificationCodeField( {
	code,
	label = __( 'Your agency’s discount code' ),
	help = __( 'Each developer can use it once, when buying the exam on Webassessor.' ),
}: {
	code: string;
	label?: string;
	help?: string;
} ) {
	const { createSuccessNotice } = useDispatch( noticesStore );

	return (
		<ClipboardInputControl
			label={ label }
			value={ code }
			readOnly
			help={ help }
			onCopy={ () =>
				createSuccessNotice( __( 'Discount code copied to clipboard.' ), { type: 'snackbar' } )
			}
		/>
	);
}
