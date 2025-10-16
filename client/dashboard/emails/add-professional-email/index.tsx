import { domainQuery, mailboxAccountsQuery, productsQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { Button, Card, CardBody } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { __, sprintf } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../app/auth';
import { ButtonStack } from '../../components/button-stack';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import {
	FIELD_NAME,
	FIELD_FIRSTNAME,
	FIELD_LASTNAME,
	FIELD_IS_ADMIN,
	FIELD_PASSWORD_RESET_EMAIL,
	FIELD_MAILBOX,
	FIELD_PASSWORD,
} from '../entities/constants';
import { MailboxForm as MailboxFormEntity } from '../entities/mailbox-form';
import { MailboxOperations } from '../entities/mailbox-operations';
import { FormFieldNames, MutableFormFieldNames, SupportedEmailProvider } from '../entities/types';
import { IntervalLength } from '../types';
import { getProductSlugForProviderAndInterval } from '../utils/get-product-slug-for-provider-and-interval';
import { MailboxForm } from './components/mailbox-form';

type HiddenFieldNames = Exclude<
	MutableFormFieldNames,
	typeof FIELD_MAILBOX | typeof FIELD_PASSWORD
>;

const possibleHiddenFieldNames: HiddenFieldNames[] = [
	FIELD_NAME,
	FIELD_FIRSTNAME,
	FIELD_LASTNAME,
	FIELD_IS_ADMIN,
	FIELD_PASSWORD_RESET_EMAIL,
];

const AddProfessionalEmail = () => {
	const { user } = useAuth();
	const { createErrorNotice } = useDispatch( noticesStore );
	const router = useRouter();
	// Extract params from the current match for this route
	const match = router.state.matches[ router.state.matches.length - 1 ];
	const params = ( match?.params ?? {} ) as { domain?: string; type?: string };
	const { domain: domainName = '' } = params;

	const { data: domain } = useQuery( domainQuery( domainName ) );
	const { data: products } = useQuery( productsQuery() );
	const { data: existingMailboxes, isFetched } = useQuery( {
		// @ts-expect-error the query is only enabled when domain has a value, so blog_id won't be undefined
		...mailboxAccountsQuery( domain?.blog_id, domainName ),
		enabled: !! domain,
	} );
	const [ isSubmitting, setIsSubmitting ] = useState( false );
	const [ mailboxEntities, setMailboxEntities ] = useState<
		MailboxFormEntity< SupportedEmailProvider >[]
	>( [] );

	const createNewMailbox = useCallback( () => {
		const mailbox = new MailboxFormEntity< SupportedEmailProvider >(
			'titan',
			domainName,
			( existingMailboxes ?? [] )
				.flatMap( ( emailAccount ) => emailAccount.emails )
				.map( ( emailBox ) => emailBox.mailbox )
		);

		possibleHiddenFieldNames.forEach( ( fieldName ) => {
			mailbox.setFieldIsVisible( fieldName, false );
			mailbox.setFieldIsRequired( fieldName, false );
		} );

		// Set initial values
		Object.entries( {
			[ FIELD_PASSWORD_RESET_EMAIL ]: user.email,
		} ).forEach( ( [ fieldName, value ] ) => {
			mailbox.setFieldValue( fieldName as FormFieldNames, value );
		} );

		return mailbox;
	}, [ domainName, existingMailboxes, user.email ] );

	useEffect( () => {
		isFetched && setMailboxEntities( [ createNewMailbox() ] );
	}, [ createNewMailbox, isFetched ] );

	let interval: IntervalLength = router.state.location.search.interval;
	if ( interval !== 'monthly' && interval !== 'annually' ) {
		interval = 'annually';
	}

	const handleSubmit = async () => {
		mailboxEntities.forEach( ( mailbox ) => mailbox.validate( true ) );
		const mailboxOperations = new MailboxOperations( mailboxEntities, () => {} );

		setIsSubmitting( true );

		const userCanAddEmail = domain?.current_user_can_add_email;
		const validated = await mailboxOperations.validateAndCheck( false );

		if ( ! userCanAddEmail || ! validated ) {
			if ( ! userCanAddEmail ) {
				const errors = domain?.current_user_cannot_add_email_reason.errors;
				const message = errors
					? sprintf(
							// Translators: %(errors)s is a list of errors separated by commas.
							__( 'You cannot add emails to this domain: %(errors)s.' ),
							{ errors: Object.values( errors ).join( ', ' ) }
					  )
					: __( 'You cannot add email to this domain.' );
				createErrorNotice( message, { type: 'snackbar' } );
			}

			setIsSubmitting( false );

			return;
		}

		const productSlug = getProductSlugForProviderAndInterval( 'titan', interval );
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const product = products[ productSlug ];
	};

	return (
		<PageLayout header={ <PageHeader /> } size="small">
			<Card>
				<CardBody>
					{ mailboxEntities.map( ( mailboxEntity, index ) => (
						<MailboxForm key={ index } mailboxEntity={ mailboxEntity } disabled={ isSubmitting } />
					) ) }
				</CardBody>
			</Card>

			<ButtonStack justify="flex-start">
				<Button
					__next40pxDefaultSize
					variant="secondary"
					disabled={ isSubmitting }
					onClick={ () => {} }
				>
					{ __( 'Add another mailbox' ) }
				</Button>
			</ButtonStack>

			<ButtonStack justify="flex-start">
				<Button
					__next40pxDefaultSize
					variant="primary"
					disabled={ isSubmitting }
					onClick={ handleSubmit }
				>
					{ __( 'Continue' ) }
				</Button>
			</ButtonStack>
		</PageLayout>
	);
};

export default AddProfessionalEmail;
