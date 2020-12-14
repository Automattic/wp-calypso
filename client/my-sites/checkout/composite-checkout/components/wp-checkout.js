/**
 * External dependencies
 */
import React, { useEffect, useState, useCallback } from 'react';
import { useTranslate } from 'i18n-calypso';
import styled from '@emotion/styled';
import {
	Checkout,
	CheckoutStep,
	CheckoutStepArea,
	CheckoutSteps,
	CheckoutStepBody,
	CheckoutSummaryArea as CheckoutSummaryAreaUnstyled,
	getDefaultPaymentMethodStep,
	useDispatch,
	useFormStatus,
	useIsStepActive,
	useIsStepComplete,
	useLineItems,
	usePaymentMethod,
	usePaymentMethodId,
	useSelect,
	useTotal,
	useTransactionStatus,
	CheckoutErrorBoundary,
} from '@automattic/composite-checkout';
import debugFactory from 'debug';
import { useShoppingCart } from '@automattic/shopping-cart';

/**
 * Internal dependencies
 */
import useCouponFieldState from '../hooks/use-coupon-field-state';
import useUpdateCartLocationWhenPaymentMethodChanges from '../hooks/use-update-cart-location-when-payment-method-changes';
import WPCheckoutOrderReview from './wp-checkout-order-review';
import WPCheckoutOrderSummary from './wp-checkout-order-summary';
import WPContactForm from './wp-contact-form';
import WPContactFormSummary from './wp-contact-form-summary';
import { isCompleteAndValid } from '../types/wpcom-store-state';
import MaterialIcon from 'calypso/components/material-icon';
import Gridicon from 'calypso/components/gridicon';
import SecondaryCartPromotions from './secondary-cart-promotions';
import {
	handleContactValidationResult,
	isContactValidationResponseValid,
	getDomainValidationResult,
	getSignupEmailValidationResult,
	getGSuiteValidationResult,
} from 'calypso/my-sites/checkout/composite-checkout/contact-validation';
import { login } from 'calypso/lib/paths';
import config from 'calypso/config';
import getContactDetailsType from '../lib/get-contact-details-type';
import {
	hasGoogleApps,
	hasDomainRegistration,
	hasTransferProduct,
} from 'calypso/lib/cart-values/cart-items';
import QueryExperiments from 'calypso/components/data/query-experiments';
import PaymentMethodStep from './payment-method-step';
import useActOnceOnStrings from '../hooks/use-act-once-on-strings';
import doesValueExist from '../lib/does-value-exist';

const debug = debugFactory( 'calypso:composite-checkout:wp-checkout' );

const ContactFormTitle = () => {
	const translate = useTranslate();
	const isActive = useIsStepActive();
	const isComplete = useIsStepComplete();
	const { responseCart } = useShoppingCart();
	const contactDetailsType = getContactDetailsType( responseCart );

	if ( contactDetailsType === 'domain' ) {
		return ! isActive && isComplete
			? translate( 'Contact information' )
			: translate( 'Enter your contact information' );
	}
	if ( contactDetailsType === 'gsuite' ) {
		return ! isActive && isComplete
			? translate( 'G Suite account information' )
			: translate( 'Enter your G Suite account information' );
	}
	return ! isActive && isComplete
		? translate( 'Billing information' )
		: translate( 'Enter your billing information' );
};

const OrderReviewTitle = () => {
	const translate = useTranslate();
	return translate( 'Your order' );
};

const paymentMethodStep = getDefaultPaymentMethodStep();

export default function WPCheckout( {
	removeProductFromCart,
	updateLocation,
	applyCoupon,
	removeCoupon,
	couponStatus,
	changePlanLength,
	siteId,
	siteUrl,
	countriesList,
	StateSelect,
	getItemVariants,
	responseCart,
	addItemToCart,
	subtotal,
	credits,
	isCartPendingUpdate,
	showErrorMessageBriefly,
	isLoggedOutCart,
	infoMessage,
	createUserAndSiteBeforeTransaction,
	recordEvent,
} ) {
	const translate = useTranslate();
	const couponFieldStateProps = useCouponFieldState( applyCoupon );
	const total = useTotal();
	const activePaymentMethod = usePaymentMethod();
	const { transactionError } = useTransactionStatus();
	const [ paymentMethodId ] = usePaymentMethodId();

	useActOnceOnStrings( [ transactionError ].filter( doesValueExist ), ( messages ) => {
		messages.forEach( ( message ) =>
			recordEvent( {
				type: 'TRANSACTION_ERROR',
				payload: { message, paymentMethodId },
			} )
		);
	} );

	const [ items ] = useLineItems();
	const areThereDomainProductsInCart =
		hasDomainRegistration( responseCart ) || hasTransferProduct( responseCart );
	const isGSuiteInCart = hasGoogleApps( responseCart );

	const contactDetailsType = getContactDetailsType( responseCart );
	const shouldShowContactStep = contactDetailsType !== 'none';

	const contactInfo = useSelect( ( sel ) => sel( 'wpcom' ).getContactInfo() ) || {};
	const { setSiteId, touchContactFields, applyDomainContactValidationResults } = useDispatch(
		'wpcom'
	);

	const [
		shouldShowContactDetailsValidationErrors,
		setShouldShowContactDetailsValidationErrors,
	] = useState( false );

	const emailTakenLoginRedirectMessage = ( emailAddress ) => {
		const redirectTo = '/checkout/no-site?cart=no-user';
		const isNative = config.isEnabled( 'login/native-login-links' );
		const loginUrl = login( { redirectTo, emailAddress, isNative } );
		const loginRedirectMessage = translate(
			'That email address is already in use. If you have an existing account, {{a}}please log in{{/a}}.',
			{
				components: {
					a: <a href={ loginUrl } />,
				},
			}
		);
		return loginRedirectMessage;
	};

	const validateContactDetailsAndDisplayErrors = async () => {
		debug( 'validating contact details and reporting errors' );
		if ( isLoggedOutCart ) {
			const email = contactInfo.email?.value ?? '';
			const validationResult = await getSignupEmailValidationResult(
				email,
				emailTakenLoginRedirectMessage
			);
			handleContactValidationResult( {
				recordEvent,
				showErrorMessage: showErrorMessageBriefly,
				paymentMethodId: activePaymentMethod.id,
				validationResult,
				applyDomainContactValidationResults,
			} );
			const isSignupValidationValid = isContactValidationResponseValid(
				validationResult,
				contactInfo
			);

			if ( ! isSignupValidationValid ) {
				return false;
			}
		}

		if ( contactDetailsType === 'domain' ) {
			const validationResult = await getDomainValidationResult( items, contactInfo );
			debug( 'validating contact details result', validationResult );
			handleContactValidationResult( {
				recordEvent,
				showErrorMessage: showErrorMessageBriefly,
				paymentMethodId: activePaymentMethod.id,
				validationResult,
				applyDomainContactValidationResults,
			} );
			return isContactValidationResponseValid( validationResult, contactInfo );
		} else if ( contactDetailsType === 'gsuite' ) {
			const validationResult = await getGSuiteValidationResult( items, contactInfo );
			debug( 'validating contact details result', validationResult );
			handleContactValidationResult( {
				recordEvent,
				showErrorMessage: showErrorMessageBriefly,
				paymentMethodId: activePaymentMethod.id,
				validationResult,
				applyDomainContactValidationResults,
			} );
			return isContactValidationResponseValid( validationResult, contactInfo );
		}
		return isCompleteAndValid( contactInfo );
	};
	const validateContactDetails = async () => {
		debug( 'validating contact details without reporting errors' );
		if ( isLoggedOutCart ) {
			const email = contactInfo.email?.value ?? '';
			const validationResult = await getSignupEmailValidationResult(
				email,
				emailTakenLoginRedirectMessage
			);
			const isSignupValidationValid = isContactValidationResponseValid(
				validationResult,
				contactInfo
			);

			if ( ! isSignupValidationValid ) {
				return false;
			}
		}

		if ( contactDetailsType === 'domain' ) {
			const validationResult = await getDomainValidationResult( items, contactInfo );
			debug( 'validating contact details result', validationResult );
			return isContactValidationResponseValid( validationResult, contactInfo );
		} else if ( contactDetailsType === 'gsuite' ) {
			const validationResult = await getGSuiteValidationResult( items, contactInfo );
			debug( 'validating contact details result', validationResult );
			return isContactValidationResponseValid( validationResult, contactInfo );
		}
		return isCompleteAndValid( contactInfo );
	};

	const [ isSummaryVisible, setIsSummaryVisible ] = useState( false );

	const [ isOrderReviewActive, setIsOrderReviewActive ] = useState( false );
	const { formStatus } = useFormStatus();

	// Copy siteId to the store so it can be more easily accessed during payment submission
	useEffect( () => {
		setSiteId( siteId );
	}, [ siteId, setSiteId ] );

	const updateCartContactDetails = useCallback( () => {
		// Update tax location in cart
		const nonTaxPaymentMethods = [ 'free-purchase' ];
		if ( ! activePaymentMethod || ! contactInfo ) {
			return;
		}
		if ( nonTaxPaymentMethods.includes( activePaymentMethod.id ) ) {
			// this data is intentionally empty so we do not charge taxes
			updateLocation( {
				countryCode: '',
				postalCode: '',
				subdivisionCode: '',
			} );
		} else {
			updateLocation( {
				countryCode: contactInfo.countryCode?.value ?? '',
				postalCode: contactInfo.postalCode?.value ?? '',
				subdivisionCode: contactInfo.state?.value ?? '',
			} );
		}
	}, [ activePaymentMethod, updateLocation, contactInfo ] );

	useUpdateCartLocationWhenPaymentMethodChanges( activePaymentMethod, updateCartContactDetails );

	const onReviewError = useCallback(
		( error ) =>
			recordEvent( {
				type: 'STEP_LOAD_ERROR',
				payload: {
					message: error,
					stepId: 'review',
				},
			} ),
		[ recordEvent ]
	);

	const onSummaryError = useCallback(
		( error ) =>
			recordEvent( {
				type: 'STEP_LOAD_ERROR',
				payload: {
					message: error,
					stepId: 'summary',
				},
			} ),
		[ recordEvent ]
	);

	const onStepNumberChange = useCallback(
		( { stepNumber, previousStepNumber } ) => {
			recordEvent( {
				type: 'STEP_NUMBER_CHANGED',
				payload: {
					stepNumber,
					previousStepNumber,
					paymentMethodId,
				},
			} );
		},
		[ paymentMethodId, recordEvent ]
	);

	const onLoadError = useCallback(
		( type, error ) => {
			const typeForAnalytics = type.replace( /\s.*/, '' );
			const stepIdMatches = type.match( /FOR STEP (\d+)/ );
			const stepId = stepIdMatches?.length > 1 ? stepIdMatches[ 1 ] : undefined;
			recordEvent( {
				type: typeForAnalytics,
				payload: {
					message: error,
					stepId,
				},
			} );
		},
		[ recordEvent ]
	);

	return (
		<Checkout>
			<QueryExperiments />
			<CheckoutSummaryArea className={ isSummaryVisible ? 'is-visible' : '' }>
				<CheckoutErrorBoundary
					errorMessage={ translate( 'Sorry, there was an error loading this information.' ) }
					onError={ onSummaryError }
				>
					<CheckoutSummaryTitleLink onClick={ () => setIsSummaryVisible( ! isSummaryVisible ) }>
						<CheckoutSummaryTitle>
							<CheckoutSummaryTitleIcon icon="info-outline" size={ 20 } />
							{ translate( 'Purchase Details' ) }
							<CheckoutSummaryTitleToggle icon="keyboard_arrow_down" />
						</CheckoutSummaryTitle>
						<CheckoutSummaryTitlePrice className="wp-checkout__total-price">
							{ total.amount.displayValue }
						</CheckoutSummaryTitlePrice>
					</CheckoutSummaryTitleLink>
					<CheckoutSummaryBody>
						<WPCheckoutOrderSummary
							onChangePlanLength={ changePlanLength }
							nextDomainIsFree={ responseCart?.next_domain_is_free }
						/>
						<SecondaryCartPromotions
							responseCart={ responseCart }
							addItemToCart={ addItemToCart }
						/>
					</CheckoutSummaryBody>
				</CheckoutErrorBoundary>
			</CheckoutSummaryArea>
			<CheckoutStepArea
				submitButtonHeader={ <SubmitButtonHeader /> }
				disableSubmitButton={ isOrderReviewActive }
				onLoadError={ onLoadError }
			>
				{ infoMessage }
				<CheckoutStepBody
					onError={ onReviewError }
					className="wp-checkout__review-order-step"
					stepId="review-order-step"
					isStepActive={ isOrderReviewActive }
					isStepComplete={ true }
					goToThisStep={ () => setIsOrderReviewActive( ! isOrderReviewActive ) }
					goToNextStep={ () => setIsOrderReviewActive( ! isOrderReviewActive ) }
					activeStepContent={
						<WPCheckoutOrderReview
							removeProductFromCart={ removeProductFromCart }
							couponStatus={ couponStatus }
							couponFieldStateProps={ couponFieldStateProps }
							removeCoupon={ removeCoupon }
							onChangePlanLength={ changePlanLength }
							getItemVariants={ getItemVariants }
							siteUrl={ siteUrl }
							siteId={ siteId }
							createUserAndSiteBeforeTransaction={ createUserAndSiteBeforeTransaction }
						/>
					}
					titleContent={ <OrderReviewTitle /> }
					completeStepContent={
						<WPCheckoutOrderReview
							isSummary
							couponStatus={ couponStatus }
							couponFieldStateProps={ couponFieldStateProps }
							siteUrl={ siteUrl }
							siteId={ siteId }
						/>
					}
					editButtonText={ translate( 'Edit' ) }
					editButtonAriaLabel={ translate( 'Edit your order' ) }
					nextStepButtonText={ translate( 'Save order' ) }
					nextStepButtonAriaLabel={ translate( 'Save your order' ) }
					validatingButtonText={
						isCartPendingUpdate ? translate( 'Updating cart…' ) : translate( 'Please wait…' )
					}
					validatingButtonAriaLabel={
						isCartPendingUpdate ? translate( 'Updating cart…' ) : translate( 'Please wait…' )
					}
					formStatus={ formStatus }
				/>
				<CheckoutSteps
					areStepsActive={ ! isOrderReviewActive }
					onStepNumberChange={ onStepNumberChange }
				>
					{ shouldShowContactStep && (
						<CheckoutStep
							onLoadError={ onLoadError }
							stepId={ 'contact-form' }
							isCompleteCallback={ () => {
								setShouldShowContactDetailsValidationErrors( true );
								// Touch the fields so they display validation errors
								touchContactFields();
								updateCartContactDetails();
								return validateContactDetailsAndDisplayErrors( isLoggedOutCart );
							} }
							activeStepContent={
								<WPContactForm
									siteUrl={ siteUrl }
									countriesList={ countriesList }
									StateSelect={ StateSelect }
									shouldShowContactDetailsValidationErrors={
										shouldShowContactDetailsValidationErrors
									}
									contactValidationCallback={ validateContactDetails }
									contactDetailsType={ contactDetailsType }
									isLoggedOutCart={ isLoggedOutCart }
								/>
							}
							completeStepContent={
								<WPContactFormSummary
									areThereDomainProductsInCart={ areThereDomainProductsInCart }
									isGSuiteInCart={ isGSuiteInCart }
									isLoggedOutCart={ isLoggedOutCart }
								/>
							}
							titleContent={ <ContactFormTitle /> }
							editButtonText={ translate( 'Edit' ) }
							editButtonAriaLabel={ translate( 'Edit the contact details' ) }
							nextStepButtonText={ translate( 'Continue' ) }
							nextStepButtonAriaLabel={ translate( 'Continue with the entered contact details' ) }
							validatingButtonText={
								isCartPendingUpdate ? translate( 'Updating cart…' ) : translate( 'Please wait…' )
							}
							validatingButtonAriaLabel={
								isCartPendingUpdate ? translate( 'Updating cart…' ) : translate( 'Please wait…' )
							}
						/>
					) }
					<CheckoutStep
						onLoadError={ onLoadError }
						stepId="payment-method-step"
						activeStepContent={
							<PaymentMethodStep
								activeStepContent={ paymentMethodStep.activeStepContent }
								subtotal={ subtotal }
								credits={ credits }
							/>
						}
						completeStepContent={ paymentMethodStep.completeStepContent }
						titleContent={ paymentMethodStep.titleContent }
						editButtonText={ translate( 'Edit' ) }
						editButtonAriaLabel={ translate( 'Edit the payment method' ) }
						nextStepButtonText={ translate( 'Continue' ) }
						nextStepButtonAriaLabel={ translate( 'Continue with the selected payment method' ) }
						validatingButtonText={
							isCartPendingUpdate ? translate( 'Updating cart…' ) : translate( 'Please wait…' )
						}
						validatingButtonAriaLabel={
							isCartPendingUpdate ? translate( 'Updating cart…' ) : translate( 'Please wait…' )
						}
					/>
				</CheckoutSteps>
			</CheckoutStepArea>
		</Checkout>
	);
}

const CheckoutSummaryArea = styled( CheckoutSummaryAreaUnstyled )`
	@media ( ${ ( props ) => props.theme.breakpoints.desktopUp } ) {
		position: relative;
	}
`;

const CheckoutSummaryTitleLink = styled.button`
	background: ${ ( props ) => props.theme.colors.background };
	border-bottom: 1px solid ${ ( props ) => props.theme.colors.borderColorLight };
	color: ${ ( props ) => props.theme.colors.textColor };
	display: flex;
	font-size: 16px;
	font-weight: ${ ( props ) => props.theme.weights.bold };
	justify-content: space-between;
	padding: 20px 23px 20px 14px;
	width: 100%;

	.rtl & {
		padding: 20px 14px 20px 23px;
	}

	.is-visible & {
		border-bottom: none;
	}

	@media ( ${ ( props ) => props.theme.breakpoints.smallPhoneUp } ) {
		border: 1px solid ${ ( props ) => props.theme.colors.borderColorLight };
		border-bottom: none 0;
	}

	@media ( ${ ( props ) => props.theme.breakpoints.desktopUp } ) {
		display: none;
	}
`;

const CheckoutSummaryTitle = styled.span`
	display: flex;
`;

const CheckoutSummaryTitleIcon = styled( Gridicon )`
	margin-right: 4px;

	.rtl & {
		margin-right: 0;
		margin-left: 4px;
	}
`;

const CheckoutSummaryTitleToggle = styled( MaterialIcon )`
	fill: ${ ( props ) => props.theme.colors.textColor };
	margin-left: 4px;
	transition: transform 0.1s linear;
	width: 18px;
	height: 18px;
	vertical-align: bottom;

	.rtl & {
		margin-right: 0;
		margin-left: 4px;
	}

	.is-visible & {
		transform: rotate( 180deg );
	}
`;

const CheckoutSummaryTitlePrice = styled.span`
	.is-visible & {
		display: none;
	}
`;

const CheckoutSummaryBody = styled.div`
	border-bottom: 1px solid ${ ( props ) => props.theme.colors.borderColorLight };
	display: none;

	.is-visible & {
		display: block;
	}

	@media ( ${ ( props ) => props.theme.breakpoints.smallPhoneUp } ) {
		border-bottom: none;
	}

	@media ( ${ ( props ) => props.theme.breakpoints.desktopUp } ) {
		display: block;
		max-width: 328px;
		position: fixed;
		width: 100%;
	}
`;

function SubmitButtonHeader() {
	const translate = useTranslate();

	const scrollToTOS = () => document.getElementById( 'checkout-terms' ).scrollIntoView();

	return (
		<SubmitButtonHeaderWrapper>
			{ translate( 'By continuing, you agree to our {{button}}Terms of Service{{/button}}.', {
				components: {
					button: <button onClick={ scrollToTOS } />,
				},
			} ) }
		</SubmitButtonHeaderWrapper>
	);
}

const SubmitButtonHeaderWrapper = styled.div`
	display: none;
	font-size: 13px;
	margin-top: -5px;
	margin-bottom: 10px;
	text-align: center;

	.checkout__step-wrapper--last-step & {
		display: block;

		@media ( ${ ( props ) => props.theme.breakpoints.tabletUp } ) {
			display: none;
		}
	}

	button {
		color: ${ ( props ) => props.theme.colors.highlight };
		display: inline;
		font-size: 13px;
		text-decoration: underline;
		width: auto;

		&:hover {
			color: ${ ( props ) => props.theme.colors.highlightOver };
		}
	}
`;
