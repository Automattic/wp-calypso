import { resendIcannVerificationEmailMutation } from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import {
	Button,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import Notice from '../../components/notice';

export default function IcannSuspensionNotice( { domainName }: { domainName: string } ) {
	const resendIcannVerificationEmail = useMutation(
		resendIcannVerificationEmailMutation( domainName )
	);
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );
	const onClick = () => {
		resendIcannVerificationEmail.mutate( undefined, {
			onSuccess: () => {
				createSuccessNotice( __( 'ICANN verification email sent' ), {
					type: 'snackbar',
				} );
			},
			onError: () => {
				createErrorNotice( __( 'Failed to send ICANN verification email' ), {
					type: 'snackbar',
				} );
			},
		} );
	};
	return (
		<Notice variant="error" title={ __( 'Email verification required' ) }>
			<VStack spacing={ 4 }>
				<Text>
					{ __(
						'You must respond to the ICANN email to verify your domain email address or your domain will stop working. Check your contact information is correct below.'
					) }
				</Text>
				<Button
					variant="link"
					onClick={ onClick }
					disabled={ resendIcannVerificationEmail.isPending }
				>
					{ resendIcannVerificationEmail.isPending ? __( 'Sending…' ) : __( 'Resend email' ) }
				</Button>
			</VStack>
		</Notice>
	);
}
