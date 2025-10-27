import { isWpError } from '@automattic/api-core';
import { createTitanMailboxMutation, mailboxAccountsQuery } from '@automattic/api-queries';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { __experimentalVStack as VStack, Button, Card, CardBody } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { __, sprintf } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { addQueryArgs } from '@wordpress/url';
import { FormEvent, useCallback, useEffect, useState } from 'react';
import { emailsRoute } from '../../app/router/emails';
import { ButtonStack } from '../../components/button-stack';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { MailboxForm } from '../add-mailbox/components/mailbox-form';
import { BackToEmailsPrefix } from '../components/back-to-emails-prefix';
import { FIELD_MAILBOX, FIELD_PASSWORD, FIELD_PASSWORD_RESET_EMAIL } from '../entities/constants';
import { MailboxForm as MailboxFormEntity } from '../entities/mailbox-form';
import { MailboxOperations } from '../entities/mailbox-operations';
import { useCreateNewMailbox } from '../hooks/use-create-new-mailbox';
import { useDomainFromUrlParam } from '../hooks/use-domain-from-url-param';
import { MailboxProvider } from '../types';

const SetUpMailbox = () => {
	const { createErrorNotice, createSuccessNotice } = useDispatch( noticesStore );
	const router = useRouter();

	const { domain, domainName } = useDomainFromUrlParam();
	const userCanAddEmail = domain?.current_user_can_add_email;
	const { data: existingMailboxes } = useSuspenseQuery(
		mailboxAccountsQuery( domain.blog_id, domainName )
	);
	const { mutateAsync: createTitanMailbox, isPending } = useMutation(
		createTitanMailboxMutation()
	);

	const [ isSubmitting, setIsSubmitting ] = useState( false );
	const [ mailboxEntities, setMailboxEntities ] = useState<
		MailboxFormEntity< MailboxProvider >[]
	>( [] );

	const createNewMailbox = useCreateNewMailbox( {
		domainName,
		existingMailboxes,
		provider: MailboxProvider.Titan,
	} );

	const persistMailboxesToState = useCallback( () => {
		setMailboxEntities( [ ...mailboxEntities ] );
	}, [ mailboxEntities ] );

	useEffect( () => {
		setMailboxEntities( [ createNewMailbox() ] );
		// eslint-disable-next-line react-hooks/exhaustive-deps -- Only want to run this on mount
	}, [] );

	const handleSubmit = async ( e: FormEvent< HTMLFormElement > ) => {
		e.preventDefault();

		mailboxEntities.forEach( ( mailbox ) => mailbox.validate() );
		persistMailboxesToState();
		const mailboxOperations = new MailboxOperations( mailboxEntities, persistMailboxesToState );

		setIsSubmitting( true );

		const validated = await mailboxOperations.validateAndCheck( false );

		if ( ! userCanAddEmail || ! validated ) {
			if ( ! userCanAddEmail ) {
				const errors = domain?.current_user_cannot_add_email_reason?.errors;
				const message = errors
					? sprintf(
							// Translators: %(errors)s is a list of errors separated by commas.
							__( 'You cannot add emails to this domain: %(errors)s.' ),
							{ errors: Object.values( errors ).join( ', ' ) }
					  )
					: __( 'You cannot add emails to this domain.' );
				createErrorNotice( message, { type: 'snackbar' } );
			}

			setIsSubmitting( false );

			return;
		}

		const [ mailbox ] = mailboxOperations.mailboxes;

		try {
			const localPart = mailbox.getFieldValue< string >( FIELD_MAILBOX )?.toLowerCase() || '';
			await createTitanMailbox( {
				domainName: domainName,
				name: '',
				mailbox: localPart,
				password: mailbox.getFieldValue( FIELD_PASSWORD ) || '',
				passwordResetEmail: mailbox.getFieldValue( FIELD_PASSWORD_RESET_EMAIL ) || '',
				isAdmin: false,
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

		setIsSubmitting( false );
	};

	const disabled = isSubmitting || isPending;

	return (
		<PageLayout header={ <PageHeader prefix={ <BackToEmailsPrefix /> } /> } size="small">
			<form onSubmit={ handleSubmit }>
				<VStack spacing={ 6 }>
					{ mailboxEntities.map( ( mailboxEntity, index ) => (
						<Card key={ index }>
							<CardBody>
								<MailboxForm
									mailboxEntity={ mailboxEntity }
									disabled={ disabled }
									onChange={ persistMailboxesToState }
								/>
							</CardBody>
						</Card>
					) ) }

					<ButtonStack justify="flex-start">
						<Button __next40pxDefaultSize variant="primary" disabled={ disabled } type="submit">
							{ __( 'Complete setup' ) }
						</Button>
					</ButtonStack>
				</VStack>
			</form>
		</PageLayout>
	);
};

export default SetUpMailbox;
