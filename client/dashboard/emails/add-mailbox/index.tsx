import { createTitanMailboxMutation, mailboxAccountsQuery } from '@automattic/api-queries';
import { formatCurrency } from '@automattic/number-formatters';
import { useSuspenseQuery, useMutation } from '@tanstack/react-query';
import { useMatch, useParams } from '@tanstack/react-router';
import { __experimentalVStack as VStack, Button, Card, CardBody } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { __, sprintf } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { FormEvent, useCallback, useEffect, useState } from 'react';
import { addMailboxRoute } from '../../app/router/emails';
import { ButtonStack } from '../../components/button-stack';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { BackToEmailsPrefix } from '../components/back-to-emails-prefix';
import { EmailNonDomainOwnerNotice } from '../components/email-non-domain-owner-notice';
import { MailboxForm as MailboxFormEntity } from '../entities/mailbox-form';
import { MailboxOperations } from '../entities/mailbox-operations';
import { useAddToCart } from '../hooks/use-add-to-cart';
import { useCreateNewMailbox } from '../hooks/use-create-new-mailbox';
import { useDomainFromUrlParam } from '../hooks/use-domain-from-url-param';
import { useEmailProduct } from '../hooks/use-email-product';
import { useSetUpMailbox } from '../hooks/use-set-up-mailbox';
import { MailboxProvider } from '../types';
import { getTotalCost } from '../utils/get-total-cost';
import { Cart } from './components/cart';
import { MailboxForm } from './components/mailbox-form';
import { PricingNotice } from './components/pricing-notice';

const AddProfessionalEmail = () => {
	const addToCart = useAddToCart();
	const setUpMailbox = useSetUpMailbox();
	const { createErrorNotice } = useDispatch( noticesStore );
	const match = useMatch( { strict: false } );
	const { isPending } = useMutation( createTitanMailboxMutation() );

	// @ts-expect-error -- 'path' does ineed exist on route options
	const isAddMailboxRoute = match.fullPath === `/${ addMailboxRoute.options.path }`;

	const { provider, interval } = useParams( { shouldThrow: false, strict: false } );

	const { domain, domainName, site } = useDomainFromUrlParam();
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

	const filledMailboxes = mailboxEntities.filter( ( mailbox ) => mailbox.isValid() );
	const totalItems = filledMailboxes.length;
	let totalPrice = '0';
	if ( isAddMailboxRoute ) {
		const totalCost = getTotalCost( {
			amount: totalItems,
			domain: domain,
			product: product,
		} );
		totalPrice = formatCurrency( totalCost, product.currency_code, {
			stripZeros: true,
		} );
	}

	return (
		<PageLayout
			header={ <PageHeader prefix={ <BackToEmailsPrefix /> } /> }
			size="small"
			notices={
				showEmailPurchaseDisabledMessage && (
					<EmailNonDomainOwnerNotice
						selectedSite={ site }
						domain={ domain }
						source="email-comparison"
					/>
				)
			}
		>
			{ isAddMailboxRoute && (
				<PricingNotice
					domain={ domain }
					product={ product }
					showEmailPurchaseDisabledMessage={ showEmailPurchaseDisabledMessage }
				/>
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
									setMailboxEntities( ( prevMailboxEntities ) => [
										...prevMailboxEntities,
										createNewMailbox(),
									] );
								} }
							>
								{ __( 'Add another mailbox' ) }
							</Button>
						) : (
							<Button __next40pxDefaultSize variant="primary" disabled={ disabled } type="submit">
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
