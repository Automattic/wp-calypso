import { isWpError } from '@automattic/api-core';
import { createTitanMailboxMutation } from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { useDispatch } from '@wordpress/data';
import { __, sprintf } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { addQueryArgs } from '@wordpress/url';
import { useAnalytics } from '../../app/analytics';
import { emailsRoute } from '../../app/router/emails';
import { FIELD_MAILBOX, FIELD_PASSWORD, FIELD_PASSWORD_RESET_EMAIL } from '../entities/constants';
import { MailboxOperations } from '../entities/mailbox-operations';
import { useDomainFromUrlParam } from './use-domain-from-url-param';

export const useSetUpMailbox = () => {
	const { recordTracksEvent } = useAnalytics();
	const { createErrorNotice, createSuccessNotice } = useDispatch( noticesStore );
	const router = useRouter();
	const { domainName } = useDomainFromUrlParam();
	const { mutateAsync: createTitanMailbox } = useMutation( createTitanMailboxMutation() );

	const setUpMailbox = async ( {
		mailboxOperations,
		onFinally,
	}: {
		mailboxOperations: MailboxOperations;
		onFinally: () => void;
	} ) => {
		const [ mailbox ] = mailboxOperations.mailboxes;

		try {
			const localPart = mailbox.getFieldValue< string >( FIELD_MAILBOX )?.toLowerCase() || '';
			await createTitanMailbox( {
				domainName,
				name: '',
				mailbox: localPart,
				password: mailbox.getFieldValue( FIELD_PASSWORD ) || '',
				passwordResetEmail: mailbox.getFieldValue( FIELD_PASSWORD_RESET_EMAIL ) || '',
				isAdmin: false,
			} );

			recordTracksEvent( 'calypso_dashboard_emails_setup_mailbox_success', {
				domainName,
			} );

			createSuccessNotice( __( 'The mailbox has been successfully set up.' ), {
				type: 'snackbar',
			} );

			router.navigate( {
				to: addQueryArgs( emailsRoute.fullPath, {
					domain_to_poll: domainName,
					mailbox_to_poll: localPart,
				} ),
			} );
		} catch ( error: unknown ) {
			recordTracksEvent( 'calypso_dashboard_emails_setup_mailbox_failure', {
				domainName,
				error: isWpError( error ) ? error.message : String( error ),
			} );

			createErrorNotice(
				isWpError( error )
					? sprintf(
							// Translators: %(error)s is the error message.
							__( 'The mailbox setup failed: %(error)s' ),
							{ error: error.message }
					  )
					: __( 'The mailbox setup failed.' ),
				{ type: 'snackbar' }
			);
		}

		onFinally();
	};

	return setUpMailbox;
};
