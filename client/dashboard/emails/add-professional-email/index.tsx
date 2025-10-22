import { mailboxAccountsQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { Button, Card, CardBody, __experimentalVStack as VStack } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { __, sprintf } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { FormEvent, useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../app/auth';
import { ButtonStack } from '../../components/button-stack';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { CartActionError } from '../../shopping-cart/errors';
import { getEmailCheckoutPath } from '../../utils/email-paths';
import { EmailNonDomainOwnerNotice } from '../components/email-non-domain-owner-notice';
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
import { useDomainFromUrlParam } from '../hooks/use-domain-from-url-param';
import { useEmailProduct } from '../hooks/use-email-product';
import { IntervalLength } from '../types';
import { getCartItems } from '../utils/get-cart-items';
import { getEmailProductProperties } from '../utils/get-email-product-properties';
import { MailboxForm } from './components/mailbox-form';
import { PricingNotice } from './components/pricing-notice';

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

	let interval: IntervalLength = router.state.location.search.interval;
	if ( interval !== 'monthly' && interval !== 'annually' ) {
		interval = 'annually';
	}

	const { domain, domainName, site } = useDomainFromUrlParam();
	const userCanAddEmail = domain?.current_user_can_add_email;
	const { product } = useEmailProduct( 'titan', interval );
	const { data: existingMailboxes, isFetched } = useQuery(
		mailboxAccountsQuery( domain.blog_id, domainName )
	);
	const [ isSubmitting, setIsSubmitting ] = useState( false );
	const [ mailboxEntities, setMailboxEntities ] = useState<
		MailboxFormEntity< SupportedEmailProvider >[]
	>( [] );

	const isDomainInCart = false; // TODO: This can be set as a prop if we implement `EmailProvidersUpsell`

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

	const persistMailboxesToState = useCallback( () => {
		setMailboxEntities( [ ...mailboxEntities ] );
	}, [ mailboxEntities ] );

	useEffect( () => {
		isFetched && setMailboxEntities( [ createNewMailbox() ] );
	}, [ createNewMailbox, isFetched ] );

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

	return (
		<PageLayout
			header={ <PageHeader /> }
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

					<ButtonStack justify="flex-start">
						<Button __next40pxDefaultSize variant="primary" disabled={ disabled } type="submit">
							{ __( 'Continue' ) }
						</Button>
					</ButtonStack>
				</VStack>
			</form>
		</PageLayout>
	);
};

export default AddProfessionalEmail;
