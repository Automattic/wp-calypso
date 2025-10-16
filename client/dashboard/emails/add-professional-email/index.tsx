import { Product } from '@automattic/api-core';
import {
	domainQuery,
	mailboxAccountsQuery,
	productsQuery,
	siteBySlugQuery,
} from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { Button, Card, CardBody, __experimentalVStack as VStack } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { __, sprintf } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { add } from 'date-fns';
import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../app/auth';
import { useLocale } from '../../app/locale';
import { ButtonStack } from '../../components/button-stack';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { Text } from '../../components/text';
import { CartActionError } from '../../shopping-cart/errors';
import { formatDate } from '../../utils/datetime';
import { getEmailCheckoutPath } from '../../utils/email-paths';
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
import { getCartItems } from '../utils/get-cart-items';
import { getEmailProductProperties } from '../utils/get-email-product-properties';
import { getProductSlugForProviderAndInterval } from '../utils/get-product-slug-for-provider-and-interval';
import { EmailNonDomainOwnerNotice } from './components/email-non-domain-owner-notice';
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
	const locale = useLocale();
	const router = useRouter();
	// Extract params from the current match for this route
	const match = router.state.matches[ router.state.matches.length - 1 ];
	const params = ( match?.params ?? {} ) as { domain?: string; type?: string };
	const { domain: domainName = '' } = params;

	let interval: IntervalLength = router.state.location.search.interval;
	if ( interval !== 'monthly' && interval !== 'annually' ) {
		interval = 'annually';
	}

	const { data: domain, isFetched: isDomainFetched } = useQuery( domainQuery( domainName ) );
	const userCanAddEmail = domain?.current_user_can_add_email;
	const { data: products } = useQuery( productsQuery() );
	const productSlug = getProductSlugForProviderAndInterval( 'titan', interval );
	const product = products?.[ productSlug ] as Product;
	const { data: site } = useQuery( siteBySlugQuery( domainName ) );
	const { data: existingMailboxes, isFetched } = useQuery( {
		// @ts-expect-error the query is only enabled when domain has a value, so blog_id won't be undefined
		...mailboxAccountsQuery( domain?.blog_id, domainName ),
		enabled: !! domain,
	} );
	const [ isSubmitting, setIsSubmitting ] = useState( false );
	const [ mailboxEntities, setMailboxEntities ] = useState<
		MailboxFormEntity< SupportedEmailProvider >[]
	>( [] );

	useEffect( () => {
		if ( isDomainFetched && ! domain ) {
			router.navigate( { to: '/emails' } );
		}
	}, [ domain, isDomainFetched, router ] );

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

	useEffect( () => {
		isFetched && setMailboxEntities( [ createNewMailbox() ] );
	}, [ createNewMailbox, isFetched ] );

	const handleSubmit = async () => {
		const { shoppingCartManagerClient } = await import(
			/* webpackChunkName: "async-load-shopping-cart" */ '../../app/shopping-cart'
		);

		mailboxEntities.forEach( ( mailbox ) => mailbox.validate( true ) );
		const mailboxOperations = new MailboxOperations( mailboxEntities, () => {} );

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
			domainName,
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
				createErrorNotice( error.message, { type: 'snackbar' } );
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

	let endDate = new Date();
	const hasOffer =
		product?.introductory_offer &&
		product?.introductory_offer.interval_count > 0 &&
		product?.introductory_offer?.interval_unit;
	if ( hasOffer ) {
		const count = product?.introductory_offer?.interval_count;
		const unit = product?.introductory_offer?.interval_unit;
		switch ( unit ) {
			case 'year':
				endDate = add( new Date(), { years: count } );
				break;
			case 'month':
				endDate = add( new Date(), { months: count } );
				break;
			case 'week':
				endDate = add( new Date(), { weeks: count } );
				break;
			case 'day':
				endDate = add( new Date(), { days: count } );
				break;
		}
	}

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
			<Text as="p">
				{ hasOffer && ! showEmailPurchaseDisabledMessage
					? sprintf(
							// Translators: %(cost)s is the displayed cost, %(termLocalized)s is the localized term (e.g. "year"), %(endDate)s is the date the trial ends (e.g. "October 26, 2005").
							__(
								'Add as many mailboxes as you need. Each one will renew at the regular price of %(cost)s per %(termLocalized)s (excl. taxes) when your free trial ends on %(endDate)s.'
							),
							{
								cost: product.combined_cost_display,
								termLocalized: product.product_term_localized,
								endDate: formatDate( endDate, locale, { dateStyle: 'long' } ),
							}
					  )
					: sprintf(
							// Translators: %(cost)s is the displayed cost, %(termLocalized)s is the localized term (e.g. "year").
							__(
								'Add as many mailboxes as you need. Each one has a price of %(cost)s per %(termLocalized)s (excl. taxes).'
							),
							{
								cost: product.combined_cost_display,
								termLocalized: product.product_term_localized,
							}
					  ) }
			</Text>

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
						<Button
							__next40pxDefaultSize
							variant="primary"
							disabled={ disabled }
							onClick={ handleSubmit }
						>
							{ __( 'Continue' ) }
						</Button>
					</ButtonStack>
				</VStack>
			</form>
		</PageLayout>
	);
};

export default AddProfessionalEmail;
