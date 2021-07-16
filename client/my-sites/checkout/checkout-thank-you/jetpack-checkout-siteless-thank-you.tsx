/**
 * External dependencies
 */
import React, { FC, useState, useCallback, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslate } from 'i18n-calypso';
import page from 'page';
import classNames from 'classnames';
import { Card } from '@automattic/components';

/**
 * Internal dependencies
 */
import FormLabel from 'calypso/components/forms/form-label';
import FormTextInput from 'calypso/components/forms/form-text-input';
import FormInputValidation from 'calypso/components/forms/form-input-validation';
import FormButton from 'calypso/components/forms/form-button';
import JetpackLogo from 'calypso/components/jetpack-logo';
import QueryProducts from 'calypso/components/data/query-products-list';
import {
	isProductsListFetching as getIsProductListFetching,
	getProductName,
} from 'calypso/state/products-list/selectors';
import { cleanUrl } from 'calypso/jetpack-connect/utils.js';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { requestUpdateJetpackCheckoutSupportTicket } from 'calypso/state/jetpack-checkout/actions';
import Main from 'calypso/components/main';
import getJetpackCheckoutSupportTicketStatus from 'calypso/state/selectors/get-jetpack-checkout-support-ticket-status';

interface Props {
	productSlug: string | 'no_product';
	receiptId?: number;
}

const JetpackCheckoutSitelessThankYou: FC< Props > = ( { productSlug, receiptId = 0 } ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const hasProductInfo = productSlug !== 'no_product';

	const productName = useSelector( ( state ) =>
		hasProductInfo ? getProductName( state, productSlug ) : null
	) as string | null;

	const isProductListFetching = useSelector( ( state ) =>
		getIsProductListFetching( state )
	) as boolean;

	const supportTicketStatus = useSelector( ( state ) =>
		getJetpackCheckoutSupportTicketStatus( state, receiptId )
	);

	const jetpackInstallInstructionsLink =
		'https://jetpack.com/support/getting-started-with-jetpack/';

	const happinessAppointmentLink = `/checkout/jetpack/schedule-happiness-appointment`;

	const [ siteInput, setSiteInput ] = useState( '' );

	const onUrlChange = useCallback( ( e ) => {
		const siteUrl = e.target.value;
		setSiteInput( siteUrl );
	}, [] );

	const onUrlSubmit = useCallback( () => {
		const siteUrl = cleanUrl( siteInput );
		if ( siteUrl ) {
			dispatch(
				recordTracksEvent( 'calypso_siteless_checkout_submit_website_address', {
					product_slug: productSlug,
					site_url: siteUrl,
					receipt_id: receiptId,
				} )
			);
			dispatch( requestUpdateJetpackCheckoutSupportTicket( siteUrl, receiptId ) );
		}
	}, [ siteInput, dispatch, productSlug, receiptId ] );

	useEffect( () => {
		if ( supportTicketStatus && supportTicketStatus === 'success' ) {
			page.redirect( `/checkout/jetpack/thank-you-completed/no-site/${ productSlug }` );
		}
	}, [ supportTicketStatus, productSlug, receiptId ] );

	return (
		<Main fullWidthLayout className="jetpack-checkout-siteless-thank-you">
			<PageViewTracker
				path="/checkout/jetpack/thank-you/no-site/:product"
				title="Checkout > Jetpack Siteless Thank You"
				properties={ { product_slug: productSlug } }
			/>
			<Card className="jetpack-checkout-siteless-thank-you__card">
				<div className="jetpack-checkout-siteless-thank-you__card-main">
					<JetpackLogo full size={ 45 } />
					{ hasProductInfo && <QueryProducts type="jetpack" /> }
					<h1 className="jetpack-checkout-siteless-thank-you__main-message">
						{ translate( 'Thank you for your purchase!' ) }{ ' ' }
						{ String.fromCodePoint( 0x1f389 ) /* Celebration emoji 🎉 */ }
					</h1>
					<p>
						{ translate( "Here's how to get started with Jetpack." ) }
						<br />
						{ translate( "We've also sent you an email with these instructions." ) }
					</p>
					<div className="jetpack-checkout-siteless-thank-you__step">
						<div className="jetpack-checkout-siteless-thank-you__step-number">1</div>
						<div className="jetpack-checkout-siteless-thank-you__step-content">
							<h2>{ translate( 'Install Jetpack' ) }</h2>
							<p>
								{ translate(
									'Download Jetpack or install it directly from your site by following the {{a}}instructions we put together here{{/a}}.',
									{
										components: {
											a: (
												<a
													className="jetpack-checkout-siteless-thank-you__link"
													target="_blank"
													rel="noopener noreferrer"
													onClick={ () =>
														dispatch(
															recordTracksEvent(
																'calypso_siteless_checkout_install_instructions_link_clicked',
																{
																	product_slug: productSlug,
																}
															)
														)
													}
													href={ jetpackInstallInstructionsLink }
												/>
											),
										},
									}
								) }
							</p>
						</div>
					</div>
					{ hasProductInfo && ( isProductListFetching || productName ) && (
						<div className="jetpack-checkout-siteless-thank-you__step">
							<div className="jetpack-checkout-siteless-thank-you__step-number">2</div>
							<div className="jetpack-checkout-siteless-thank-you__step-content">
								<h2>{ translate( 'Let us know your website address' ) }</h2>
								<p
									className={
										isProductListFetching
											? 'jetpack-checkout-siteless-thank-you__product-info-loading'
											: 'jetpack-checkout-siteless-thank-you__product-info'
									}
								>
									{ translate( 'What site will you be adding %(productName)s to?', {
										args: {
											productName,
										},
									} ) }
									<br />
									{ translate( 'Knowing this will allow us to jumpstart the activation process.' ) }
								</p>
								<FormLabel
									className="jetpack-checkout-siteless-thank-you__form-label"
									htmlFor="website-address-input"
								>
									Your website address:
								</FormLabel>
								<div className="jetpack-checkout-siteless-thank-you__form-group" role="group">
									<FormTextInput
										className={ classNames( 'jetpack-checkout-siteless-thank-you__form-input', {
											'is-error': supportTicketStatus && supportTicketStatus === 'failed',
										} ) }
										autoCapitalize="off"
										value={ siteInput }
										placeholder="https://yourjetpack.blog"
										onChange={ onUrlChange }
										autoFocus={ true } // eslint-disable-line jsx-a11y/no-autofocus
									/>
									<FormButton
										className="jetpack-checkout-siteless-thank-you__form-submit"
										disabled={ ! siteInput || supportTicketStatus === 'pending' }
										busy={ supportTicketStatus === 'pending' }
										onClick={ onUrlSubmit }
									>
										{ translate( 'Continue' ) }
									</FormButton>
								</div>
								{ supportTicketStatus && supportTicketStatus === 'failed' && (
									<FormInputValidation
										isError
										text={ translate(
											'There was a problem submitting your website address, please try again.'
										) }
									></FormInputValidation>
								) }
							</div>
						</div>
					) }
				</div>
				<div className="jetpack-checkout-siteless-thank-you__card-footer">
					<div>
						<h2>{ translate( 'Do you need help?' ) }</h2>
						<p>
							{ translate(
								'If you prefer to setup Jetpack with the help of our Happiness Engineers, {{a}}schedule a 15 minute call now{{/a}}.',
								{
									components: {
										a: (
											<a
												className="jetpack-checkout-siteless-thank-you__link"
												onClick={ () =>
													dispatch(
														recordTracksEvent( 'calypso_siteless_checkout_happiness_link_clicked', {
															product_slug: productSlug,
														} )
													)
												}
												href={ happinessAppointmentLink }
											/>
										),
									},
								}
							) }
						</p>
					</div>
				</div>
			</Card>
		</Main>
	);
};

export default JetpackCheckoutSitelessThankYou;
