/**
 * External dependencies
 */
import React, { FC, useState, useCallback, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslate, TranslateResult } from 'i18n-calypso';
import page from 'page';
import classNames from 'classnames';
import { Button, Card } from '@automattic/components';
import { openPopupWidget } from 'react-calendly';

/**
 * Internal dependencies
 */
import { addQueryArgs, resemblesUrl } from 'calypso/lib/url';
import { addHttpIfMissing } from 'calypso/my-sites/checkout/utils';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import {
	isProductsListFetching as getIsProductListFetching,
	getProductName,
} from 'calypso/state/products-list/selectors';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { requestUpdateJetpackCheckoutSupportTicket } from 'calypso/state/jetpack-checkout/actions';
import FormButton from 'calypso/components/forms/form-button';
import FormInputValidation from 'calypso/components/forms/form-input-validation';
import FormLabel from 'calypso/components/forms/form-label';
import FormTextInput from 'calypso/components/forms/form-text-input';
import getCalendlyUrl from 'calypso/lib/jetpack/get-calendly-url';
import getJetpackCheckoutSupportTicketStatus from 'calypso/state/selectors/get-jetpack-checkout-support-ticket-status';
import JetpackLogo from 'calypso/components/jetpack-logo';
import Main from 'calypso/components/main';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import QueryProducts from 'calypso/components/data/query-products-list';
import { useSetCalendlyListenerEffect } from './hooks';

/**
 * Type dependencies
 */
import type { UserData } from 'calypso/lib/user/user';

interface Props {
	forScheduling: boolean;
	productSlug: string | 'no_product';
	receiptId?: number;
	source?: string;
	jetpackTemporarySiteId?: number;
}

const JetpackCheckoutSitelessThankYou: FC< Props > = ( {
	forScheduling,
	productSlug,
	receiptId = 0,
	source = 'onboarding-calypso-ui',
	jetpackTemporarySiteId = 0,
} ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const hasProductInfo = productSlug !== 'no_product';

	const productName = useSelector( ( state ) =>
		hasProductInfo ? getProductName( state, productSlug ) : null
	);

	const calendlyUrl = getCalendlyUrl();
	const currentUser = useSelector( ( state ) => getCurrentUser( state ) ) as UserData;

	const isProductListFetching = useSelector( ( state ) => getIsProductListFetching( state ) );

	const supportTicketStatus = useSelector( ( state ) =>
		getJetpackCheckoutSupportTicketStatus( state, receiptId )
	);

	const jetpackInstallInstructionsLink =
		'https://jetpack.com/support/install-jetpack-and-connect-your-new-plan/';

	const [ siteInput, setSiteInput ] = useState( '' );
	const [ isFormDirty, setIsFormDirty ] = useState( false );
	const [ error, setError ] = useState< TranslateResult | false >( false );

	const onUrlChange = useCallback(
		( e ) => {
			const siteUrl = e.target.value;
			setSiteInput( siteUrl );
			if ( isFormDirty ) {
				if ( ! resemblesUrl( addHttpIfMissing( siteUrl ) ) ) {
					setError( translate( 'That is not a valid website URL.' ) );
				} else {
					setError( false );
				}
			}
		},
		[ translate, isFormDirty ]
	);

	const onUrlSubmit = useCallback(
		( e ) => {
			e.preventDefault();
			setIsFormDirty( true );
			const siteUrl = addHttpIfMissing( siteInput );
			setSiteInput( siteUrl );

			if ( ! resemblesUrl( siteUrl ) ) {
				setError( translate( 'That is not a valid website URL.' ) );
				return;
			}

			dispatch(
				recordTracksEvent( 'calypso_siteless_checkout_submit_website_address', {
					product_slug: productSlug,
					site_url: siteUrl,
					receipt_id: receiptId,
				} )
			);
			dispatch(
				requestUpdateJetpackCheckoutSupportTicket(
					siteUrl,
					receiptId,
					source,
					jetpackTemporarySiteId
				)
			);
		},
		[ siteInput, dispatch, translate, productSlug, receiptId, source, jetpackTemporarySiteId ]
	);

	const onScheduleClick = useCallback( () => {
		if ( calendlyUrl !== null ) {
			dispatch(
				recordTracksEvent( 'calypso_siteless_checkout_happiness_link_clicked', {
					product_slug: productSlug,
				} )
			);
			openPopupWidget( {
				url: calendlyUrl,
				pageSettings: {
					// --studio-jetpack-green
					primaryColor: '069e08',
				},
				prefill: {
					email: currentUser?.email,
					name: currentUser?.display_name,
				},
			} );
		}
	}, [ calendlyUrl, currentUser, dispatch, productSlug ] );

	// Update the ZD ticket linked to `receiptId` after the user has scheduled a call.
	useSetCalendlyListenerEffect( { productSlug, receiptId, jetpackTemporarySiteId } );

	useEffect( () => {
		if ( supportTicketStatus === 'success' ) {
			const thankYouCompletedUrl = addQueryArgs(
				{
					jetpackTemporarySiteId,
					productSlug,
					receiptId,
				},
				`/checkout/jetpack/thank-you-completed/no-site/${ productSlug }`
			);
			page( thankYouCompletedUrl );
		} else if ( supportTicketStatus === 'failed' ) {
			setError(
				translate( 'There was a problem submitting your website address, please try again.' )
			);
		}
	}, [ jetpackTemporarySiteId, receiptId, supportTicketStatus, productSlug, translate ] );

	useEffect( () => {
		if ( forScheduling ) {
			onScheduleClick();
		}
		/* this effect is used in the the style of a `useMountEffect` */
	}, [] ); // eslint-disable-line react-hooks/exhaustive-deps

	return (
		<Main fullWidthLayout className="jetpack-checkout-siteless-thank-you">
			<PageViewTracker
				options={ { useJetpackGoogleAnalytics: true } }
				path={
					forScheduling
						? '/checkout/jetpack/schedule-happiness-appointment'
						: '/checkout/jetpack/thank-you/no-site/:product'
				}
				properties={ { product_slug: productSlug } }
				title="Checkout > Jetpack Siteless Thank You"
			/>
			<Card className="jetpack-checkout-siteless-thank-you__card">
				<div className="jetpack-checkout-siteless-thank-you__card-main">
					<JetpackLogo size={ 45 } />
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
								<form onSubmit={ onUrlSubmit }>
									<FormLabel
										className="jetpack-checkout-siteless-thank-you__form-label"
										htmlFor="website-address-input"
									>
										Your website address:
									</FormLabel>
									<div className="jetpack-checkout-siteless-thank-you__form-group" role="group">
										<FormTextInput
											className={ classNames( 'jetpack-checkout-siteless-thank-you__form-input', {
												'is-error': error,
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
										>
											{ supportTicketStatus === 'pending'
												? translate( 'Saving…' )
												: translate( 'Continue' ) }
										</FormButton>
									</div>
									{ error && (
										<FormInputValidation
											isError={ !! ( isFormDirty && error ) }
											text={ error }
										></FormInputValidation>
									) }
								</form>
							</div>
						</div>
					) }
				</div>
				{ calendlyUrl !== null && (
					<div className="jetpack-checkout-siteless-thank-you__card-footer">
						<div>
							<h2>{ translate( 'Do you need help?' ) }</h2>
							<p>{ translate( 'Setup Jetpack with the help of our Happiness Engineers.' ) }</p>
							<Button
								className="jetpack-checkout-siteless-thank-you__button"
								onClick={ onScheduleClick }
							>
								{ translate( 'Schedule a 15 minute call now.' ) }
							</Button>
						</div>
					</div>
				) }
			</Card>
		</Main>
	);
};

export default JetpackCheckoutSitelessThankYou;
