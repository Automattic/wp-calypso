import { domainQuery, mailboxAccountsQuery, productsQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { Button, Card, CardBody } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useCallback, useEffect, useState } from 'react';
import { ButtonStack } from '../../components/button-stack';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { MailboxForm as MailboxFormEntity } from '../entities/mailbox-form';
import { SupportedEmailProvider } from '../entities/types';
import { IntervalLength } from '../types';
import { getProductSlugForProviderAndInterval } from '../utils/get-product-slug-for-provider-and-interval';
import { MailboxForm } from './components/mailbox-form';

const AddProfessionalEmail = () => {
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
		// Set initial values
		// Object.entries( initialFieldValues ).forEach( ( [ fieldName, value ] ) => {
		// 	mailbox.setFieldValue( fieldName as FormFieldNames, value );
		// } );
		return mailbox;
	}, [ domainName, existingMailboxes ] );

	useEffect( () => {
		isFetched && setMailboxEntities( [ createNewMailbox() ] );
	}, [ createNewMailbox, isFetched ] );

	let interval: IntervalLength = router.state.location.search.interval;
	if ( interval !== 'monthly' && interval !== 'annually' ) {
		interval = 'annually';
	}

	const handleSubmit = async () => {
		setIsSubmitting( true );

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
