/**
 * UpgradeSlideOver — PROTOTYPE
 *
 * A Vercel-style checkout panel that slides in from the right, so upgrading
 * never leaves the page the user is on. Left column: what the selected plan
 * includes. Right column: plan + billing cycle selection, then a payment
 * card (grey surface) with card details and billing fields, and a pricing
 * summary above the pay button.
 *
 * Form controls and buttons are @wordpress/ui (WPDS). All data is mocked
 * (see ./plans-data). Nothing is charged.
 */

import { Gridicon } from '@automattic/components';
import { Button, InputControl, SelectControl } from '@wordpress/ui';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
	COUNTRIES,
	formatEuro,
	getPrototypePlan,
	PROTOTYPE_PLANS,
	TAX_ID_TYPES,
} from './plans-data';
import type { BillingCycleSlug } from './plans-data';

import './style.scss';

interface UpgradeSlideOverProps {
	onClose: () => void;
	initialPlan?: string;
}

type Step = 'checkout' | 'processing' | 'success';

// Matches --wpds-motion-duration-lg, used for the slide-out transition.
const CLOSE_ANIMATION_MS = 300;

function formatCardNumber( value: string ): string {
	const digits = value.replace( /\D/g, '' ).slice( 0, 16 );
	return digits.replace( /(\d{4})(?=\d)/g, '$1 ' );
}

function formatExpiry( value: string ): string {
	const digits = value.replace( /\D/g, '' ).slice( 0, 4 );
	if ( digits.length <= 2 ) {
		return digits;
	}
	return `${ digits.slice( 0, 2 ) } / ${ digits.slice( 2 ) }`;
}

// The `@wordpress/ui` SelectControl passes the whole { value, label } item
// object to onValueChange; unwrap it to the plain value.
function unwrapSelectValue( value: unknown ): string {
	if ( value && typeof value === 'object' && 'value' in value ) {
		return String( ( value as { value: unknown } ).value );
	}
	return String( value );
}

export default function UpgradeSlideOver( {
	onClose,
	initialPlan = 'personal',
}: UpgradeSlideOverProps ) {
	const [ isVisible, setIsVisible ] = useState( false );
	const [ step, setStep ] = useState< Step >( 'checkout' );
	const [ planSlug, setPlanSlug ] = useState( initialPlan );
	const [ cycle, setCycle ] = useState< BillingCycleSlug >( 'yearly' );
	const [ showCoupon, setShowCoupon ] = useState( false );
	const [ coupon, setCoupon ] = useState( '' );
	const [ cardNumber, setCardNumber ] = useState( '' );
	const [ expiry, setExpiry ] = useState( '' );
	const [ cvc, setCvc ] = useState( '' );
	const [ fullName, setFullName ] = useState( '' );
	const [ country, setCountry ] = useState( 'Spain' );
	const [ address, setAddress ] = useState( '' );
	const [ useAsPrimary, setUseAsPrimary ] = useState( true );
	const [ taxIdType, setTaxIdType ] = useState( 'EU VAT number' );
	const [ taxId, setTaxId ] = useState( '' );
	const [ showErrors, setShowErrors ] = useState( false );
	// Prototype-only: toggles between a user with a saved card and one without.
	const [ hasSavedCard, setHasSavedCard ] = useState( false );
	// Set by "Change payment method" to enter a new card despite a saved one.
	const [ useDifferentCard, setUseDifferentCard ] = useState( false );

	const showingSavedCard = hasSavedCard && ! useDifferentCard;
	const panelRef = useRef< HTMLDivElement >( null );
	const closeTimer = useRef< ReturnType< typeof setTimeout > | undefined >( undefined );

	const plan = getPrototypePlan( planSlug );
	const price = plan.billing[ cycle ];
	const monthlyPrice = plan.billing.monthly.perMonth;
	const showsDiscount = cycle !== 'monthly' && price.perMonth < monthlyPrice;
	// "billed every 12 months" → "every 12 months", for the charge note.
	const renewText = price.billedText.replace( 'billed ', '' );

	// @wordpress/ui SelectControl is controlled via the item OBJECT, not the
	// raw value (see its tests: defaultValue={ items[1] }).
	const planItems = PROTOTYPE_PLANS.map( ( { slug, label } ) => ( { value: slug, label } ) );
	const cycleItems = Object.values( plan.billing ).map( ( option ) => ( {
		value: option.slug,
		label: `${ option.label } · ${ formatEuro( option.perMonth ) }/mo`,
	} ) );
	const countryItems = COUNTRIES.map( ( name ) => ( { value: name, label: name } ) );
	const taxIdTypeItems = TAX_ID_TYPES.map( ( name ) => ( { value: name, label: name } ) );

	// Animate in on mount.
	useEffect( () => {
		const raf = requestAnimationFrame( () => setIsVisible( true ) );
		return () => cancelAnimationFrame( raf );
	}, [] );

	// Lock body scroll while open.
	useEffect( () => {
		document.body.classList.add( 'upgrade-slide-over-open' );
		return () => document.body.classList.remove( 'upgrade-slide-over-open' );
	}, [] );

	// Move focus into the dialog.
	useEffect( () => {
		panelRef.current?.focus();
	}, [] );

	const requestClose = useCallback( () => {
		setIsVisible( false );
		closeTimer.current = setTimeout( onClose, CLOSE_ANIMATION_MS );
	}, [ onClose ] );

	useEffect( () => () => clearTimeout( closeTimer.current ), [] );

	// Close on Escape, but not mid-payment.
	useEffect( () => {
		const onKeyDown = ( event: KeyboardEvent ) => {
			if ( event.key === 'Escape' && step !== 'processing' ) {
				requestClose();
			}
		};
		document.addEventListener( 'keydown', onKeyDown );
		return () => document.removeEventListener( 'keydown', onKeyDown );
	}, [ requestClose, step ] );

	// Per-field validity; errors only show after a pay attempt. A saved card
	// is always payable.
	const cardNumberValid = cardNumber.replace( /\D/g, '' ).length >= 15;
	const expiryValid = expiry.replace( /\D/g, '' ).length === 4;
	const cvcValid = cvc.length >= 3;
	const fullNameValid = fullName.trim().length > 0;
	const canPay =
		showingSavedCard || ( cardNumberValid && expiryValid && cvcValid && fullNameValid );

	const handlePay = () => {
		if ( ! canPay ) {
			setShowErrors( true );
			return;
		}
		setShowErrors( false );
		setStep( 'processing' );
		// Fake a payment round-trip.
		setTimeout( () => setStep( 'success' ), 1400 );
	};

	const switchPrototypeMode = ( savedCard: boolean ) => {
		setHasSavedCard( savedCard );
		setUseDifferentCard( false );
		setShowErrors( false );
	};

	const content = (
		<div className={ `upgrade-slide-over ${ isVisible ? 'is-visible' : '' }` } role="presentation">
			<button
				type="button"
				className="upgrade-slide-over__backdrop"
				aria-label="Close upgrade panel"
				tabIndex={ -1 }
				onClick={ step !== 'processing' ? requestClose : undefined }
			/>
			{ /* Prototype-only mode switch, not part of the design. */ }
			<div className="upgrade-slide-over__proto-toggle" role="group" aria-label="Prototype mode">
				<span>Prototype</span>
				<button
					type="button"
					className={ hasSavedCard ? 'is-active' : undefined }
					onClick={ () => switchPrototypeMode( true ) }
				>
					Card
				</button>
				<button
					type="button"
					className={ ! hasSavedCard ? 'is-active' : undefined }
					onClick={ () => switchPrototypeMode( false ) }
				>
					No card
				</button>
			</div>
			<div
				className="upgrade-slide-over__panel"
				role="dialog"
				aria-modal="true"
				aria-label="Upgrade plan"
				ref={ panelRef }
				tabIndex={ -1 }
			>
				{ step === 'success' ? (
					<div className="upgrade-slide-over__success">
						<div className="upgrade-slide-over__success-icon">
							<Gridicon icon="checkmark" size={ 36 } />
						</div>
						<h2>You're on { plan.label.replace( 'WordPress.com ', '' ) }!</h2>
						<p>
							Your upgrade is active. Pick up right where you left off, nothing on this page has
							changed.
						</p>
						<Button
							variant="solid"
							className="upgrade-slide-over__pay-button"
							onClick={ requestClose }
						>
							Done
						</Button>
					</div>
				) : (
					<>
						<aside className="upgrade-slide-over__features">
							<h3>What's included in { plan.label.replace( 'WordPress.com ', '' ) }</h3>
							<p className="upgrade-slide-over__tagline">{ plan.tagline }</p>
							<ul>
								{ plan.features.map( ( feature ) => (
									<li key={ feature }>
										<Gridicon icon="checkmark" size={ 16 } />
										<span>{ feature }</span>
									</li>
								) ) }
							</ul>
						</aside>

						<div className="upgrade-slide-over__checkout">
							<div className="upgrade-slide-over__header">
								<h2>Upgrade plan</h2>
								<button
									type="button"
									className="upgrade-slide-over__close"
									aria-label="Close"
									onClick={ requestClose }
									disabled={ step === 'processing' }
								>
									<Gridicon icon="cross" size={ 18 } />
								</button>
							</div>

							<div className="upgrade-slide-over__body">
								<section>
									<h4 className="upgrade-slide-over__section-title">
										<span className="upgrade-slide-over__step-number">1</span> Your plan
									</h4>
									<SelectControl
										label="Plan"
										hideLabelFromVision
										value={ planItems.find( ( item ) => item.value === planSlug ) }
										items={ planItems }
										onValueChange={ ( value ) => setPlanSlug( unwrapSelectValue( value ) ) }
									/>
									<SelectControl
										label="Billing cycle"
										hideLabelFromVision
										value={ cycleItems.find( ( item ) => item.value === cycle ) }
										items={ cycleItems }
										onValueChange={ ( value ) =>
											setCycle( unwrapSelectValue( value ) as BillingCycleSlug )
										}
									/>
									{ showCoupon ? (
										<InputControl
											label="Coupon code"
											hideLabelFromVision
											placeholder="Coupon code"
											value={ coupon }
											onChange={ ( event ) => setCoupon( event.target.value ) }
										/>
									) : (
										<button
											type="button"
											className="upgrade-slide-over__coupon-link"
											onClick={ () => setShowCoupon( true ) }
										>
											+ Add coupon code
										</button>
									) }
								</section>

								<section>
									<h4 className="upgrade-slide-over__section-title">
										<span className="upgrade-slide-over__step-number">2</span> Payment &amp; billing
										details
									</h4>

									{ showingSavedCard ? (
										<div className="upgrade-slide-over__payment-card is-saved">
											<div className="upgrade-slide-over__saved-card">
												<Gridicon icon="credit-card" size={ 24 } />
												<div className="upgrade-slide-over__saved-card-details">
													<strong>Visa ending in 3779</strong>
													<span>exp. 9/2027</span>
													<span>nuriapenya@gmail.com</span>
												</div>
											</div>
											<button
												type="button"
												className="upgrade-slide-over__change-method"
												onClick={ () => setUseDifferentCard( true ) }
											>
												Change payment method
											</button>
										</div>
									) : (
										<div className="upgrade-slide-over__payment-card">
											<div className="upgrade-slide-over__card-row">
												<InputControl
													label="Card number"
													placeholder="1234 1234 1234 1234"
													autoComplete="cc-number"
													inputMode="numeric"
													className={ showErrors && ! cardNumberValid ? 'is-error' : undefined }
													value={ cardNumber }
													onChange={ ( event ) =>
														setCardNumber( formatCardNumber( event.target.value ) )
													}
												/>
												<InputControl
													label="Expiry date"
													placeholder="MM / YY"
													autoComplete="cc-exp"
													inputMode="numeric"
													className={ showErrors && ! expiryValid ? 'is-error' : undefined }
													value={ expiry }
													onChange={ ( event ) => setExpiry( formatExpiry( event.target.value ) ) }
												/>
												<InputControl
													label="Security code"
													placeholder="CVC"
													autoComplete="cc-csc"
													inputMode="numeric"
													className={ showErrors && ! cvcValid ? 'is-error' : undefined }
													value={ cvc }
													onChange={ ( event ) =>
														setCvc( event.target.value.replace( /\D/g, '' ).slice( 0, 4 ) )
													}
												/>
											</div>
											{ showErrors && ! canPay && (
												<p className="upgrade-slide-over__card-error" role="alert">
													Check your card details: the highlighted fields are incomplete or invalid.
												</p>
											) }

											<InputControl
												label="Full name"
												placeholder="Jane Doe"
												autoComplete="name"
												className={ showErrors && ! fullNameValid ? 'is-error' : undefined }
												value={ fullName }
												onChange={ ( event ) => setFullName( event.target.value ) }
											/>
											<SelectControl
												label="Country or region"
												value={ countryItems.find( ( item ) => item.value === country ) }
												items={ countryItems }
												onValueChange={ ( value ) => setCountry( unwrapSelectValue( value ) ) }
											/>
											<InputControl
												label="Address"
												autoComplete="street-address"
												value={ address }
												onChange={ ( event ) => setAddress( event.target.value ) }
											/>
											<label className="upgrade-slide-over__checkbox-row">
												<input
													type="checkbox"
													checked={ useAsPrimary }
													onChange={ ( event ) => setUseAsPrimary( event.target.checked ) }
												/>
												<span>Use the billing address as my account's primary address</span>
											</label>
											<div className="upgrade-slide-over__tax-block">
												<span className="upgrade-slide-over__tax-label">Tax ID (optional)</span>
												<div className="upgrade-slide-over__tax-row">
													<SelectControl
														label="Tax ID type"
														hideLabelFromVision
														value={ taxIdTypeItems.find( ( item ) => item.value === taxIdType ) }
														items={ taxIdTypeItems }
														onValueChange={ ( value ) =>
															setTaxIdType( unwrapSelectValue( value ) )
														}
													/>
													<InputControl
														label="Tax ID"
														hideLabelFromVision
														placeholder="ES00000000"
														value={ taxId }
														onChange={ ( event ) => setTaxId( event.target.value ) }
													/>
												</div>
											</div>
										</div>
									) }
								</section>

								<div className="upgrade-slide-over__summary">
									<p className="upgrade-slide-over__summary-note">
										Upon clicking Pay, you will be charged { formatEuro( price.billedTotal ) },
										immediately and then { renewText }, until you cancel. Tax amounts are an
										estimate only and actual tax charged may differ.
									</p>
									<div className="upgrade-slide-over__summary-table">
										<div className="upgrade-slide-over__summary-row is-header">
											<span>Product</span>
											<span>Cost</span>
										</div>
										<div className="upgrade-slide-over__summary-row">
											<span className="upgrade-slide-over__summary-product">
												{ plan.label }
												<span className="upgrade-slide-over__summary-detail">
													{ price.label } ·{ ' ' }
													{ showsDiscount && <s>{ formatEuro( monthlyPrice ) }</s> }{ ' ' }
													{ formatEuro( price.perMonth ) }/mo
													{ price.saveBadge && (
														<span className="upgrade-slide-over__save-badge">
															{ price.saveBadge }
														</span>
													) }
												</span>
											</span>
											<span className="upgrade-slide-over__summary-cost">
												{ formatEuro( price.billedTotal ) }
											</span>
										</div>
									</div>
								</div>
							</div>

							<div className="upgrade-slide-over__footer">
								<Button
									variant="solid"
									className="upgrade-slide-over__pay-button"
									disabled={ step === 'processing' }
									onClick={ handlePay }
								>
									{ step === 'processing' ? (
										'Processing…'
									) : (
										<>
											<Gridicon icon="lock" size={ 16 } />
											Pay { formatEuro( price.billedTotal ) } now
										</>
									) }
								</Button>
								<p className="upgrade-slide-over__guarantee">14-day money-back guarantee</p>
							</div>
						</div>
					</>
				) }
			</div>
		</div>
	);

	return createPortal( content, document.body );
}
