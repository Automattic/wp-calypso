import { resendIcannVerificationEmailMutation } from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import {
	Button,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { useAnalytics } from '../../app/analytics';
import { useLocale } from '../../app/locale';
import { domainContactInfoRoute } from '../../app/router/domains';
import { withSnackbar } from '../../app/snackbars/with-snackbar';
import Notice from '../../components/notice';
import { formatDate } from '../../utils/datetime';
import type { Domain } from '@automattic/api-core';
import type { ReactNode } from 'react';

function getContactAddressHint() {
	return __(
		'This is your domain’s contact address, which may differ from your WordPress.com account email.'
	);
}

function getPendingSentences( domain: Domain, formattedDeadline: string ) {
	const sentences: ReactNode[] = [];

	if ( domain.domain_registrant_email ) {
		sentences.push(
			createInterpolateElement(
				sprintf(
					/* translators: %s: the email address the ICANN verification email was sent to */
					__( 'We sent a verification email to <strong>%s</strong>.' ),
					domain.domain_registrant_email
				),
				{ strong: <strong /> }
			)
		);
	} else {
		sentences.push(
			__(
				'We sent a verification email to your domain’s contact address, which may differ from your WordPress.com account email.'
			)
		);
	}

	if ( formattedDeadline ) {
		sentences.push(
			createInterpolateElement(
				sprintf(
					/* translators: %s: the date by which the domain must be verified */
					__(
						'Follow the instructions in that email by <strong>%s</strong> or your domain will be suspended.'
					),
					formattedDeadline
				),
				{ strong: <strong /> }
			)
		);
	} else {
		sentences.push(
			__( 'Follow the instructions in that email or your domain will be suspended.' )
		);
	}

	if ( domain.domain_registrant_email ) {
		sentences.push( getContactAddressHint() );
	}

	return sentences;
}

function getSuspendedSentences( domain: Domain ) {
	const sentences: ReactNode[] = [
		createInterpolateElement(
			sprintf(
				/* translators: %s: the domain name */
				__(
					'<strong>%s</strong> was suspended because its contact email address was not verified.'
				),
				domain.domain
			),
			{ strong: <strong /> }
		),
	];

	if ( domain.domain_registrant_email ) {
		sentences.push(
			createInterpolateElement(
				sprintf(
					/* translators: %s: the email address the ICANN verification email was sent to */
					__(
						'To reactivate it, follow the instructions in the verification email we sent to <strong>%s</strong>.'
					),
					domain.domain_registrant_email
				),
				{ strong: <strong /> }
			),
			getContactAddressHint()
		);
	} else {
		sentences.push(
			__(
				'To reactivate it, follow the instructions in the verification email we sent to your domain’s contact address, which may differ from your WordPress.com account email.'
			)
		);
	}

	return sentences;
}

export default function IcannSuspensionNotice( { domain }: { domain: Domain } ) {
	const domainName = domain.domain;
	const locale = useLocale();
	const resendIcannVerificationEmail = useMutation(
		withSnackbar( resendIcannVerificationEmailMutation( domainName ), {
			success: __(
				'Verification email sent! It should arrive within a few minutes. Please check your inbox and follow the instructions to verify your domain name.'
			),
			error: { source: 'server' },
		} )
	);
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

	const isSuspended = domain.is_icann_verification_suspended;
	const formattedDeadline = domain.contact_verification_deadline
		? formatDate( new Date( domain.contact_verification_deadline ), locale, { dateStyle: 'long' } )
		: '';

	const sentences = [
		...( isSuspended
			? getSuspendedSentences( domain )
			: getPendingSentences( domain, formattedDeadline ) ),
		__(
			'If the address is correct but you can’t find the email, use the button below to resend it.'
		),
		createInterpolateElement(
			__(
				'If you no longer have access to it, <link>change the contact email address</link> and we’ll send a new verification email.'
			),
			{ link: <Link to={ domainContactInfoRoute.fullPath } params={ { domainName } } /> }
		),
	];

	return (
		<Notice
			variant="error"
			title={ isSuspended ? __( 'Domain suspended' ) : __( 'Email verification required' ) }
		>
			<VStack spacing={ 4 }>
				<Text>
					{ sentences.map( ( sentence, index ) => (
						<span key={ index }>
							{ index > 0 && ' ' }
							{ sentence }
						</span>
					) ) }
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
