import { resendIcannVerificationEmailMutation } from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import {
	Button,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useAnalytics } from '../../app/analytics';
import Notice from '../../components/notice';

export default function IcannSuspensionNotice( { domainName }: { domainName: string } ) {
	const resendIcannVerificationEmail = useMutation( {
		...resendIcannVerificationEmailMutation( domainName ),
		meta: {
			snackbar: {
				success: __(
					'Verification email sent! It should arrive within a few minutes. Please check your inbox and follow the instructions to verify your domain name.'
				),
				error: { source: 'server' },
			},
		},
	} );
	const { recordTracksEvent } = useAnalytics();

	const onClick = () => {
		recordTracksEvent( 'calypso_dashboard_domains_icann_suspension_notice_resend_email', {
			domain_name: domainName,
		} );

		resendIcannVerificationEmail.mutate( undefined, {
			onSuccess: () => {
				recordTracksEvent(
					'calypso_dashboard_domains_icann_suspension_notice_resend_email_success',
					{
						domain_name: domainName,
					}
				);
			},
			onError: ( error ) => {
				recordTracksEvent( 'calypso_dashboard_domains_icann_suspension_notice_resend_email_error', {
					domain_name: domainName,
					error_message: error.message,
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
