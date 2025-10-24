import { createTitanMailboxMutation, mailboxAccountsQuery } from '@automattic/api-queries';
import { formatCurrency } from '@automattic/number-formatters';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { __experimentalVStack as VStack, Button, Card, CardBody } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { __, sprintf } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { FormEvent, useCallback, useEffect, useState } from 'react';
import { ButtonStack } from '../../components/button-stack';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { CartActionError } from '../../shopping-cart/errors';
import { getEmailCheckoutPath } from '../../utils/email-paths';
import { BackToEmailsPrefix } from '../components/back-to-emails-prefix';
import { EmailNonDomainOwnerNotice } from '../components/email-non-domain-owner-notice';
import {
	FIELD_IS_ADMIN,
	FIELD_MAILBOX,
	FIELD_NAME,
	FIELD_PASSWORD,
	FIELD_PASSWORD_RESET_EMAIL,
} from '../entities/constants';
import { MailboxForm as MailboxFormEntity } from '../entities/mailbox-form';
import { MailboxOperations } from '../entities/mailbox-operations';
import { SupportedEmailProvider } from '../entities/types';
import { useCreateNewMailbox } from '../hooks/use-create-new-mailbox';
import { useDomainFromUrlParam } from '../hooks/use-domain-from-url-param';
import { useEmailProduct } from '../hooks/use-email-product';
import { IntervalLength } from '../types';
import { getCartItems } from '../utils/get-cart-items';
import { getEmailProductProperties } from '../utils/get-email-product-properties';
import { getTotalCost } from '../utils/get-total-cost';
import { Cart } from './components/cart';
import { MailboxForm } from './components/mailbox-form';
import { PricingNotice } from './components/pricing-notice';

const AddProfessionalEmail = () => {
	const { createErrorNotice } = useDispatch( noticesStore );
	const router = useRouter();

	let interval: IntervalLength = router.state.location.search.interval;
	if ( interval !== 'monthly' && interval !== 'annually' ) {
		interval = 'annually';
	}

	const { domain, domainName, site } = useDomainFromUrlParam();
	const userCanAddEmail = domain?.current_user_can_add_email;
	const { product } = useEmailProduct( 'titan', interval );
	const { data: existingMailboxes } = useSuspenseQuery(
		mailboxAccountsQuery( domain.blog_id, domainName )
	);
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const { mutateAsync: createTitanMailbox, isPending } = useMutation(
		createTitanMailboxMutation()
	);
	const hasUnusedMailbox = existingMailboxes?.some(
		( mailbox ) =>
			mailbox.product_slug === product.product_slug &&
			( mailbox.warnings ?? [] ).some(
				( w ) => w.warning_slug === 'unused_mailboxes' && w.warning_type === 'notice'
			)
	);

	// console.debug( 'product', product );
	// console.debug( 'existingMailboxes', existingMailboxes );
	// console.debug( 'hasUnusedMailbox', hasUnusedMailbox );

	const [ isSubmitting, setIsSubmitting ] = useState( false );
	const [ mailboxEntities, setMailboxEntities ] = useState<
		MailboxFormEntity< SupportedEmailProvider >[]
	>( [] );

	const isDomainInCart = false; // TODO: This can be set as a prop if we implement `EmailProvidersUpsell`

	const createNewMailbox = useCreateNewMailbox( {
		domainName,
		existingMailboxes,
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

		const { shoppingCartManagerClient } = await import(
			/* webpackChunkName: "async-load-shopping-cart" */ '../../app/shopping-cart'
		);

		mailboxEntities.forEach( ( mailbox ) => mailbox.validate( true ) );
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

		if ( hasUnusedMailbox ) {
			// console.debug( 'mailboxEntities', mailboxEntities );
			// console.debug( 'mailboxOperations.mailboxes', mailboxOperations.mailboxes );

			// TODO: There's a maximum_mailboxes on existingMailboxes that needs to be taken into account
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const results = await Promise.allSettled(
				mailboxOperations.mailboxes.map( ( mailbox ) =>
					createTitanMailbox( {
						domainName: domainName,
						name: mailbox.getFieldValue( FIELD_NAME ) || '',
						mailbox: mailbox.getFieldValue< string >( FIELD_MAILBOX )?.toLowerCase() || '',
						password: mailbox.getFieldValue( FIELD_PASSWORD ) || '',
						passwordResetEmail: mailbox.getFieldValue( FIELD_PASSWORD_RESET_EMAIL ) || '',
						isAdmin: mailbox.getFieldValue( FIELD_IS_ADMIN ) || false,
					} )
				)
			);

			// TODO: Handle accepted results properly
			// {
			//     "status": "fulfilled",
			//     "value": {
			//         "message": "Accepted",
			//         "status": 202
			//     }
			// }
			// TODO: Handle rejected results properly
			// [
			//     {
			//         "status": "rejected",
			//         "reason": {
			//             "path": "/emails/titan/xavilcbusiness20251010bis.com/mailbox/create",
			//             "apiNamespace": "wpcom/v2",
			//             "body": {
			//                 "name": "",
			//                 "mailbox": "test@xavilcbusiness20251010bis.com",
			//                 "password": "2132123123132123123",
			//                 "alternate_email_address": "xavier.lozano.carreras@gmail.com",
			//                 "is_admin": false
			//             },
			//             "method": "POST",
			//             "apiVersion": "1.1",
			//             "query": "",
			//             "callback": "c3f5a419-f820-45c9-aed3-e51e28092ad1",
			//             "supports_args": true,
			//             "supports_error_obj": true,
			//             "supports_progress": true,
			//             "name": "BadRequestError",
			//             "statusCode": 400,
			//             "status": 400,
			//             "message": "Email Address: Please enter a valid email address."
			//         }
			//     },
			// ]

			// console.debug( 'results', results );

			setIsSubmitting( false );

			return;
		}

		const numberOfMailboxes = mailboxOperations.mailboxes.length;

		const emailProperties = getEmailProductProperties(
			'titan',
			domain,
			product,
			numberOfMailboxes
		);

		const checkoutPath = getEmailCheckoutPath(
			site?.slug || '',
			domain.domain,
			router.state.location.pathname,
			mailboxOperations.mailboxes[ 0 ].getAsCartItem().email
		);

		await shoppingCartManagerClient
			.forCartKey( site?.ID )
			// @ts-expect-error -- getCartItems response won't be void since the provider here is always 'titan'
			.actions.addProductsToCart( [ getCartItems( mailboxOperations.mailboxes, emailProperties ) ] )
			.then( () => {
				window.location.href = checkoutPath;
			} )
			.finally( () => setIsSubmitting( false ) )
			.catch( ( error: CartActionError ) => {
				const actions = [];

				if ( error.code === 'already-contains-an-email-product' ) {
					actions.push( { label: __( 'Shopping cart' ), url: checkoutPath } );
				}

				createErrorNotice( error.message, { actions, type: 'snackbar' } );
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
	const disabled = isSubmitting || showEmailPurchaseDisabledMessage;

	const filledMailboxes = mailboxEntities.filter( ( mailbox ) => mailbox.isValid() );
	const totalItems = filledMailboxes.length;
	const totalCost = getTotalCost( {
		amount: totalItems,
		domain: domain,
		product: product,
	} );
	const totalPrice = formatCurrency( totalCost, product.currency_code, {
		stripZeros: true,
	} );

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
			<PricingNotice
				domain={ domain }
				product={ product }
				showEmailPurchaseDisabledMessage={ showEmailPurchaseDisabledMessage }
			/>

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
					</ButtonStack>

					<Cart totalItems={ totalItems } totalPrice={ totalPrice } isCartBusy={ isSubmitting } />
				</VStack>
			</form>
		</PageLayout>
	);
};

export default AddProfessionalEmail;
