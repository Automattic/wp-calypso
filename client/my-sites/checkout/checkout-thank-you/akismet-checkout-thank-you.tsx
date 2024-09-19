import { isAkismetProduct } from '@automattic/calypso-products';
import { Button, Card } from '@automattic/components';
import { createInterpolateElement } from '@wordpress/element';
import { sprintf, __ } from '@wordpress/i18n';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useMemo, useState } from 'react';
import QueryProducts from 'calypso/components/data/query-products-list';
import QueryUserPurchases from 'calypso/components/data/query-user-purchases';
import ClipboardButton from 'calypso/components/forms/clipboard-button';
import FormTextInput from 'calypso/components/forms/form-text-input';
import Main from 'calypso/components/main';
import useAkismetKeyQuery from 'calypso/data/akismet/use-akismet-key-query';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { isAkismetTemporarySitePurchase } from 'calypso/me/purchases/utils';
import { useSelector, useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { isProductsListFetching, getProductName } from 'calypso/state/products-list/selectors';
import { getUserPurchases, isFetchingUserPurchases } from 'calypso/state/purchases/selectors';
import type { FunctionComponent } from 'react';

interface AkismetCheckoutThankYouProps {
	productSlug: string | 'no_product';
}

const AkismetCheckoutThankYou: FunctionComponent< AkismetCheckoutThankYouProps > = ( {
	productSlug,
} ) => {
	const dispatch = useDispatch();
	const hasProduct = productSlug !== 'no_product';
	const productName = useSelector( ( state ) =>
		hasProduct ? getProductName( state, productSlug ) : null
	);
	const isLoading = useSelector(
		( state ) => isProductsListFetching( state ) || isFetchingUserPurchases( state )
	);

	const onManagePurchaseClick = () => {
		dispatch(
			recordTracksEvent( 'calypso_akismet_checkout_thank_you_page_manage_purchase_click', {
				product_slug: productSlug,
			} )
		);
	};

	const userActivePurchases = useSelector(
		( state ) => getUserPurchases( state )?.filter( ( purchase ) => purchase.active ) ?? []
	);

	const { thanksHeadline, thanksMessage } = useMemo( () => {
		const akismetPurchases = userActivePurchases.filter(
			( purchase ) => isAkismetProduct( purchase ) && isAkismetTemporarySitePurchase( purchase )
		);

		let thanksHeadline = (
			<>
				{ /* the single space literal below is intentional for rendering purposes */ }
				{ __( 'Let the spam-blocking party begin!', 'akismet-thank-you' ) }{ ' ' }
				<span className="akismet-checkout-thank-you__emoji">
					{ String.fromCodePoint( 0x1f389 ) /* Celebration emoji 🎉 */ }
				</span>
			</>
		);

		let thanksMessage = createInterpolateElement(
			sprintf(
				// translators: %s is the product name
				__(
					'Thanks for your purchase. We have sent you an email with your receipt and further instructions on how to activate <strong>%s</strong>.',
					'akismet-thank-you'
				),
				productName
			),
			{ strong: <strong /> }
		);

		// If the user already has another Akismet product, adjust the messaging.
		if ( akismetPurchases.length > 1 ) {
			thanksHeadline = (
				<>
					{ /* the single space literal below is intentional for rendering purposes */ }
					{ __( 'Congrats on your shiny new spam-blocking upgrade.', 'akismet-thank-you' ) }
				</>
			);
			thanksMessage = createInterpolateElement(
				sprintf(
					// translators: %s is the product name
					__(
						'Thanks for your purchase. We have sent you an email with your receipt for <strong>%s</strong>.',
						'akismet-thank-you'
					),
					productName
				),
				{ strong: <strong /> }
			);
		}

		return {
			thanksHeadline,
			thanksMessage,
		};
	}, [ productSlug, productName, userActivePurchases ] );

	return (
		<Main className="akismet-checkout-thank-you">
			<PageViewTracker
				options={ { useAkismetGoogleAnalytics: true } }
				path="/checkout/akismet/thank-you/:productSlug"
				properties={ { product_slug: productSlug } }
				title="Checkout > Akismet Thank You"
			/>

			<Card className="akismet-checkout-thank-you__card">
				{ /* This product query takes a while to load, an improvment here would be to add a type filter on wpcom like jetpack has. See: 2f832-pb/ */ }
				{ hasProduct && <QueryProducts /> }
				<QueryUserPurchases />

				<h2
					className={
						isLoading
							? 'akismet-checkout-thank-you__main-message-loading'
							: 'akismet-checkout-thank-you__main-message'
					}
				>
					{ thanksHeadline }
				</h2>

				<p
					className={
						isLoading
							? 'akismet-checkout-thank-you__email-message-loading'
							: 'akismet-checkout-thank-you__email-message'
					}
				>
					{ thanksMessage }
				</p>

				<ThankYouAPIKeyClipboard />

				<Button
					primary
					busy={ isLoading }
					href="https://akismet.com/account/"
					onClick={ onManagePurchaseClick }
				>
					{ __( 'Manage Plan' ) }
				</Button>
			</Card>

			<div className="akismet-checkout-thank-you__footer-img"></div>
		</Main>
	);
};

function ThankYouAPIKeyClipboard() {
	const translate = useTranslate();
	const [ isCopied, setIsCopied ] = useState( false );
	const { data, isError, isLoading } = useAkismetKeyQuery();

	useEffect( () => {
		if ( isCopied ) {
			const confirmationTimeout = setTimeout( () => setIsCopied( false ), 4000 );
			return () => clearTimeout( confirmationTimeout );
		}
	}, [ isCopied ] );

	const showConfirmation = () => {
		setIsCopied( true );
	};

	if ( isError || isLoading ) {
		return null;
	}

	const akismetApiKey = data ?? '';
	const keyInputSize = akismetApiKey ? akismetApiKey.length + 5 : 0;

	return (
		<>
			<p className="akismet-checkout-thank-you__api-key-header">
				{ __( 'Your Akismet API Key is:', 'akismet-thank-you' ) }
			</p>
			<div
				className={ clsx(
					'akismet-checkout-thank-you__key-clipboard',
					isLoading ? 'loading' : ''
				) }
			>
				{ ! isLoading && (
					<>
						<FormTextInput
							className="akismet-checkout-thank-you__key-clipboard-input"
							value={ akismetApiKey }
							size={ keyInputSize }
							readOnly
						/>
						<ClipboardButton text={ akismetApiKey } onCopy={ showConfirmation } compact>
							{ isCopied ? translate( 'Copied!' ) : translate( 'Copy', { context: 'verb' } ) }
						</ClipboardButton>
					</>
				) }
			</div>
		</>
	);
}

export default AkismetCheckoutThankYou;
