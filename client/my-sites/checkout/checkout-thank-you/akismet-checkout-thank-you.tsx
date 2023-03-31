import { Button, Card } from '@automattic/components';
import { createInterpolateElement } from '@wordpress/element';
import { sprintf, __ } from '@wordpress/i18n';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import QueryProducts from 'calypso/components/data/query-products-list';
import ClipboardButton from 'calypso/components/forms/clipboard-button';
import FormTextInput from 'calypso/components/forms/form-text-input';
import Main from 'calypso/components/main';
import useAkismetKeyQuery from 'calypso/data/akismet/use-akismet-key-query';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { isProductsListFetching, getProductName } from 'calypso/state/products-list/selectors';
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
	const isLoading = useSelector( isProductsListFetching );

	const onManagePurchaseClick = () => {
		dispatch(
			recordTracksEvent( 'calypso_akismet_checkout_thank_you_page_manage_purchase_click', {
				product_slug: productSlug,
			} )
		);
	};

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

				<h2 className="akismet-checkout-thank-you__main-message">
					{ /* the single space literal below is intentional for rendering purposes */ }
					{ __( 'Let the spam-blocking party begin!', 'akismet-thank-you' ) }{ ' ' }
					<span className="akismet-checkout-thank-you__emoji">
						{ String.fromCodePoint( 0x1f389 ) /* Celebration emoji 🎉 */ }
					</span>
				</h2>

				<p
					className={
						isLoading
							? 'akismet-checkout-thank-you__email-message-loading'
							: 'akismet-checkout-thank-you__email-message'
					}
				>
					{ createInterpolateElement(
						sprintf(
							// translators: %s is the product name
							__(
								'Thanks for your purchase. We have sent you an email with your receipt and further instructions on how to activate <strong>%s</strong>.',
								'akismet-thank-you'
							),
							productName
						),
						{ strong: <strong /> }
					) }
				</p>

				<p className="akismet-checkout-thank-you__api-key-header">
					{ __( 'Your Akismet API Key is:', 'akismet-thank-you' ) }
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
	const [ isCopied, setCopied ] = useState( false );
	const { data, isError, isLoading } = useAkismetKeyQuery();

	useEffect( () => {
		if ( isCopied ) {
			const confirmationTimeout = setTimeout( () => setCopied( false ), 4000 );
			return () => clearTimeout( confirmationTimeout );
		}
	}, [ isCopied ] );

	const showConfirmation = () => {
		setCopied( true );
	};

	if ( isError ) {
		return null;
	}

	const akismetApiKey = data ?? '';
	const keyInputSize = akismetApiKey ? akismetApiKey.length + 5 : 0;

	return (
		<div
			className={ 'akismet-checkout-thank-you__key-clipboard' + ( isLoading ? ' loading' : '' ) }
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
	);
}

export default AkismetCheckoutThankYou;
