import { createTitanMailboxMutation, mailboxAccountsQuery } from '@automattic/api-queries';
import { formatCurrency } from '@automattic/number-formatters';
import { useSuspenseQuery, useMutation } from '@tanstack/react-query';
import { useMatch, useParams } from '@tanstack/react-router';
import { __experimentalVStack as VStack, Button, Notice } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { __, sprintf } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { FormEvent, useCallback, useEffect, useState } from 'react';
import { useAnalytics } from '../../app/analytics';
import Breadcrumbs from '../../app/breadcrumbs';
import { useLocale } from '../../app/locale';
import { addMailboxRoute } from '../../app/router/emails';
import { ButtonStack } from '../../components/button-stack';
import { Card, CardBody } from '../../components/card';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { Text } from '../../components/text';
import { EmailNonDomainOwnerNotice } from '../components/email-non-domain-owner-notice';
import { MailboxForm as MailboxFormEntity } from '../entities/mailbox-form';
import { MailboxOperations } from '../entities/mailbox-operations';
import { useAddToCart } from '../hooks/use-add-to-cart';
import { useCreateNewMailbox } from '../hooks/use-create-new-mailbox';
import { useDomainFromUrlParam } from '../hooks/use-domain-from-url-param';
import { useEmailProduct } from '../hooks/use-email-product';
import { useSetUpMailbox } from '../hooks/use-set-up-mailbox';
import { MailboxProvider } from '../types';
import { getMailboxCost } from '../utils/get-mailbox-cost';
import { Cart } from './components/cart';
import { MailboxForm } from './components/mailbox-form';

const AddProfessionalEmail = () => {
	const { recordTracksEvent } = useAnalytics();
	const addToCart = useAddToCart();
	const setUpMailbox = useSetUpMailbox();
	const { createErrorNotice } = useDispatch( noticesStore );
	const match = useMatch( { strict: false } );
	const { isPending } = useMutation( createTitanMailboxMutation() );
	const locale = useLocale();

	const isAddMailboxRoute = match.routeId === addMailboxRoute.id;

	const { provider, interval } = useParams( { shouldThrow: false, strict: false } );

	const { domain, domainName } = useDomainFromUrlParam();
	const userCanAddEmail = domain?.current_user_can_add_email;
	const { product } = useEmailProduct( provider, interval );
	const { data: existingMailboxes } = useSuspenseQuery(
		mailboxAccountsQuery( domain.blog_id, domainName )
	);

	const [ isSubmitting, setIsSubmitting ] = useState( false );
	const [ mailboxEntities, setMailboxEntities ] = useState<
		MailboxFormEntity< MailboxProvider >[]
	>( [] );

	const isDomainInCart = false; // TODO: This can be set as a prop if we implement `EmailProvidersUpsell`

	const createNewMailbox = useCreateNewMailbox( {
		domainName,
		existingMailboxes,
		provider: isAddMailboxRoute ? provider : MailboxProvider.Titan,
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
			recordTracksEvent(
				isAddMailboxRoute
					? 'calypso_dashboard_emails_add_mailbox_validation_failure'
					: 'calypso_dashboard_emails_setup_mailbox_validation_failure',
				{
					domainName,
					mailboxCount: mailboxEntities.length,
					provider,
					reason: validated ? 'user_cannot_add_email' : 'validation_failed',
				}
			);

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

		isAddMailboxRoute
			? addToCart( { mailboxOperations, onFinally: () => setIsSubmitting( false ) } )
			: setUpMailbox( {
					mailboxOperations,
					onFinally: () => setIsSubmitting( false ),
			  } );
	};

	const removeForm = ( index: number ) => {
		recordTracksEvent( 'calypso_dashboard_emails_add_mailbox_remove_mailbox_click', {
			domainName,
			mailboxCount: mailboxEntities.length,
			provider,
		} );

		setMailboxEntities( ( prevMailboxEntities ) => {
			const newMailboxEntities = [ ...prevMailboxEntities ];
			newMailboxEntities.splice( index, 1 );
			return newMailboxEntities;
		} );
	};

	const showEmailPurchaseDisabledMessage = ! userCanAddEmail && ! isDomainInCart;
	const disabled = isAddMailboxRoute
		? isSubmitting || showEmailPurchaseDisabledMessage
		: isSubmitting || isPending;

	let mailboxCost;
	const totalItems = mailboxEntities.length;
	let totalPrice = '0';
	if ( isAddMailboxRoute ) {
		mailboxCost = getMailboxCost( {
			domain,
			product,
			showEmailPurchaseDisabledMessage,
			locale,
		} );

		const totalCost = mailboxEntities.length * mailboxCost.amount;
		totalPrice = formatCurrency( totalCost, product.currency_code, {
			stripZeros: true,
		} );
	}

	return (
		<PageLayout
			header={
				<PageHeader
					prefix={
						<Breadcrumbs
							length={ 2 }
							onItemClick={ () => {
								recordTracksEvent(
									isAddMailboxRoute
										? 'calypso_dashboard_emails_add_mailbox_back_to_emails_click'
										: 'calypso_dashboard_emails_setup_mailbox_back_to_emails_click',
									{
										domainName,
										mailboxCount: mailboxEntities.length,
										provider,
									}
								);
							} }
						/>
					}
					description={ __( 'Add a new email mailbox to your domain.' ) }
				/>
			}
			size="small"
			notices={
				showEmailPurchaseDisabledMessage && <EmailNonDomainOwnerNotice domain={ domain } />
			}
		>
			{ isAddMailboxRoute && mailboxCost && (
				<>
					{ mailboxCost.notice ? (
						<Notice status="info" isDismissible={ false }>
							{ /* eslint-disable-next-line react/no-danger */ }
							<div dangerouslySetInnerHTML={ { __html: mailboxCost.message } } />
						</Notice>
					) : (
						// @ts-expect-error: Can only set one of `children` or `props.dangerouslySetInnerHTML`.
						<Text size={ 16 } as="p" dangerouslySetInnerHTML={ { __html: mailboxCost.message } } />
					) }
				</>
			) }

			<form onSubmit={ handleSubmit }>
				<VStack spacing={ 6 }>
					{ mailboxEntities.map( ( mailboxEntity, index ) => (
						<Card key={ index }>
							<CardBody>
								<MailboxForm
									mailboxEntity={ mailboxEntity }
									disabled={ disabled }
									onChange={ persistMailboxesToState }
									removeForm={ index > 0 ? () => removeForm( index ) : undefined }
								/>
							</CardBody>
						</Card>
					) ) }

					<ButtonStack justify="flex-start">
						{ isAddMailboxRoute ? (
							<Button
								__next40pxDefaultSize
								variant="secondary"
								disabled={ disabled }
								onClick={ () => {
									recordTracksEvent(
										'calypso_dashboard_emails_add_mailbox_add_another_mailbox_click',
										{
											domainName,
											mailboxCount: mailboxEntities.length,
											provider,
										}
									);

									setMailboxEntities( ( prevMailboxEntities ) => [
										...prevMailboxEntities,
										createNewMailbox(),
									] );
								} }
							>
								{ __( 'Add another mailbox' ) }
							</Button>
						) : (
							<Button
								__next40pxDefaultSize
								variant="primary"
								disabled={ disabled }
								type="submit"
								onClick={ () => {
									recordTracksEvent(
										'calypso_dashboard_emails_setup_mailbox_complete_setup_click',
										{
											domainName,
										}
									);
								} }
							>
								{ __( 'Complete setup' ) }
							</Button>
						) }
					</ButtonStack>

					{ isAddMailboxRoute && (
						<Cart totalItems={ totalItems } totalPrice={ totalPrice } isCartBusy={ isSubmitting } />
					) }
				</VStack>
			</form>
		</PageLayout>
	);
};

export default AddProfessionalEmail;
