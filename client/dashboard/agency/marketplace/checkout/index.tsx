import {
	Button,
	FormFileUpload,
	Modal,
	RadioControl,
	TextControl,
	TextareaControl,
	__experimentalGrid as Grid,
	__experimentalHeading as Heading,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { activeAgencyQuery } from '@automattic/api-queries';
import { Breadcrumbs } from '@automattic/components/src/breadcrumbs';
import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { __, sprintf } from '@wordpress/i18n';
import { Icon, check, chevronDown, lock, reusableBlock } from '@wordpress/icons';
import { useState } from 'react';
import { ButtonStack } from '../../../components/button-stack';
import { Card, CardBody, CardDivider, CardHeader } from '../../../components/card';
import { Notice } from '../../../components/notice';
import { PageHeader } from '../../../components/page-header';
import PageLayout from '../../../components/page-layout';
import { SectionHeader } from '../../../components/section-header';
import { formatUSD } from '../hosting/mock-data';
import './style.scss';

/**
 * A4AD-186, checkout directions for review. Three ways checkout could live on
 * the dashboard, switched with ?checkout=a|b|c (default a):
 *
 *   a  What Main does today: the WordPress.com checkout embedded in the
 *      dashboard page for purchases; Main's request-payment page for referrals.
 *   b  A review page for both: items and totals, then Pay hands off. In
 *      referral mode the request form takes the place of Pay.
 *   c  The cart drawer grows into checkout (the referral form lives in the
 *      drawer on Products). This page shows the purchase hand-off only.
 *   dotcom  The dotcom dashboard's way: the cart button goes straight to
 *      wordpress.com/checkout, no page in between. Referrals still land here.
 *
 * The cart arrives from the Products or Hosting page through sessionStorage;
 * with nothing there, a sample cart is shown so the page can be reviewed on
 * its own.
 */

export type CheckoutLine = { label: string; total: number; commission?: number };
export type CheckoutState = {
	items: CheckoutLine[];
	term: 'monthly' | 'yearly';
	referral: boolean;
};

export const CHECKOUT_STORAGE_KEY = 'a4a-proto-checkout';

export function stashCheckout( state: CheckoutState ) {
	try {
		window.sessionStorage.setItem( CHECKOUT_STORAGE_KEY, JSON.stringify( state ) );
	} catch {
		// prototype only
	}
}

function readCheckout(): CheckoutState {
	try {
		const raw = window.sessionStorage.getItem( CHECKOUT_STORAGE_KEY );
		if ( raw ) {
			return JSON.parse( raw ) as CheckoutState;
		}
	} catch {
		// fall through to the sample
	}
	const params = new URLSearchParams( window.location.search );
	return {
		items: [
			{ label: __( '3 WordPress.com sites' ), total: 600, commission: 300 },
			{ label: __( 'Jetpack VaultPress Backup (10GB)' ), total: 47.88, commission: 23.94 },
		],
		term: 'yearly',
		referral: params.has( 'refer' ),
	};
}

function suffix( term: 'monthly' | 'yearly' ) {
	return term === 'yearly' ? __( '/yr' ) : __( '/mo' );
}

function Summary( { state, compact = false }: { state: CheckoutState; compact?: boolean } ) {
	const total = state.items.reduce( ( sum, item ) => sum + item.total, 0 );
	const commission = state.items.reduce( ( sum, item ) => sum + ( item.commission ?? 0 ), 0 );
	return (
		<Card>
			<CardHeader>
				<SectionHeader level={ compact ? 3 : 2 } title={ __( 'Summary' ) } />
			</CardHeader>
			<CardBody>
				<VStack spacing={ 3 }>
					{ state.items.map( ( item ) => (
						<HStack key={ item.label } justify="space-between">
							<Text>{ item.label }</Text>
							<Text>{ formatUSD( item.total ) + suffix( state.term ) }</Text>
						</HStack>
					) ) }
					<CardDivider />
					<HStack justify="space-between">
						<Text weight={ 600 }>
							{ state.referral ? __( 'Total your client will pay' ) : __( 'Total' ) }
						</Text>
						<Heading level={ 3 } size={ 16 }>
							{ formatUSD( total ) + suffix( state.term ) }
						</Heading>
					</HStack>
					{ state.referral && commission > 0 && (
						<HStack justify="space-between">
							<Text variant="muted">{ __( 'Your estimated commission' ) }</Text>
							<Text variant="muted">{ formatUSD( commission ) + suffix( state.term ) }</Text>
						</HStack>
					) }
				</VStack>
			</CardBody>
		</Card>
	);
}

// Main's "Request client payment" form, on dashboard components: the client's
// email, a message, which logo the email carries, then send or copy a link.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// A referral link the prototype hands out. Main gets the real one back from
// the request-payment API (referral.checkout_url); this only needs to be
// something the clipboard can hold.
function makeReferralLink() {
	return (
		'https://agencies.automattic.com/client/checkout?referral=' +
		Math.random().toString( 36 ).slice( 2, 10 )
	);
}

// Main's request-payment form (client/a8c-for-agencies/sections/marketplace/
// checkout/request-client-payment.tsx), behaviour copied: Send needs a valid
// email and, with "A different logo", an uploaded file; Copy needs the email;
// both create the referral, copy the link and go to Referrals with a banner;
// Preview opens the email in a modal. The email itself is server-rendered in
// Main, so the preview here is a plain composition of the same parts.
export { finishReferral };

export function ReferralRequestForm( {
	items,
	term,
	compact = false,
	onSent,
}: {
	items: CheckoutLine[];
	term: 'monthly' | 'yearly';
	compact?: boolean;
	onSent: ( flow: 'send' | 'copy', email: string, link: string ) => void;
} ) {
	const { data: agency } = useQuery( activeAgencyQuery() );
	const agencyLogo = agency?.profile_company_logo_url || null;
	const [ email, setEmail ] = useState( '' );
	const [ emailError, setEmailError ] = useState< string | null >( null );
	const [ message, setMessage ] = useState( '' );
	const [ logo, setLogo ] = useState( agencyLogo ? 'agency' : 'other' );
	const [ logoFile, setLogoFile ] = useState< string | null >( null );
	const [ isPreviewOpen, setIsPreviewOpen ] = useState( false );
	const [ busy, setBusy ] = useState< 'send' | 'copy' | null >( null );

	const needsUpload = logo === 'other' && ! logoFile;
	const previewLogo = logo === 'agency' ? agencyLogo : logo === 'other' ? logoFile : null;

	const submit = ( flow: 'send' | 'copy' ) => {
		if ( ! EMAIL_RE.test( email ) ) {
			setEmailError( __( 'Please provide correct email address' ) );
			return;
		}
		setEmailError( null );
		setBusy( flow );
		const link = makeReferralLink();
		navigator.clipboard?.writeText( link ).catch( () => {} );
		// The request-payment call takes a moment in Main; the wait is kept so
		// the buttons show their busy state.
		window.setTimeout( () => onSent( flow, email, link ), 600 );
	};

	const buttons = (
		<>
			<Button
				variant="primary"
				__next40pxDefaultSize
				isBusy={ busy === 'send' }
				disabled={ ! email || needsUpload || busy !== null }
				onClick={ () => submit( 'send' ) }
			>
				{ __( 'Send to client' ) }
			</Button>
			<Button
				variant="secondary"
				__next40pxDefaultSize
				isBusy={ busy === 'copy' }
				disabled={ ! email || needsUpload || busy !== null }
				onClick={ () => submit( 'copy' ) }
			>
				{ __( 'Copy referral link' ) }
			</Button>
		</>
	);
	const preview = (
		<Button variant="link" onClick={ () => setIsPreviewOpen( true ) }>
			{ __( 'Preview email' ) }
		</Button>
	);

	return (
		<VStack spacing={ 4 }>
			<TextControl
				__nextHasNoMarginBottom
				__next40pxDefaultSize
				label={ __( 'Client’s email address' ) }
				type="email"
				value={ email }
				onChange={ ( value ) => {
					setEmail( value );
					if ( emailError ) {
						setEmailError( null );
					}
				} }
				help={
					emailError ?? __( 'They get an email with a link to pay. Nothing is charged to you.' )
				}
				className={ emailError ? 'marketplace-checkout__field--error' : undefined }
			/>
			<TextareaControl
				__nextHasNoMarginBottom
				label={ __( 'Custom message' ) }
				value={ message }
				onChange={ setMessage }
				rows={ compact ? 3 : 4 }
				placeholder={ __( 'Optional. A line your client will see above the order.' ) }
			/>
			<RadioControl
				label={ __( 'Your logo (Optional)' ) }
				help={ __( 'Builds trust and shows this referral comes from you.' ) }
				selected={ logo }
				options={ [
					...( agencyLogo ? [ { label: __( 'Use profile logo' ), value: 'agency' } ] : [] ),
					{
						label: agencyLogo
							? __( 'Use a different logo for this referral' )
							: __( 'Upload my logo' ),
						value: 'other',
					},
					{ label: __( 'Send without logo' ), value: 'none' },
				] }
				onChange={ setLogo }
			/>
			{ logo === 'agency' && agencyLogo && (
				<img
					src={ agencyLogo }
					alt={ __( 'Agency logo' ) }
					className="marketplace-checkout__logo-preview"
				/>
			) }
			{ logo === 'other' && (
				<VStack spacing={ 2 } alignment="flex-start">
					{ logoFile && (
						<img
							src={ logoFile }
							alt={ __( 'Uploaded logo' ) }
							className="marketplace-checkout__logo-preview"
						/>
					) }
					<FormFileUpload
						accept="image/png, image/jpeg"
						onChange={ ( event ) => {
							const file = event.currentTarget.files?.[ 0 ];
							if ( file ) {
								setLogoFile( URL.createObjectURL( file ) );
							}
							event.currentTarget.value = '';
						} }
						render={ ( { openFileDialog } ) => (
							<Button __next40pxDefaultSize variant="secondary" onClick={ openFileDialog }>
								{ logoFile ? __( 'Upload new image' ) : __( 'Upload image' ) }
							</Button>
						) }
					/>
				</VStack>
			) }
			{ compact ? (
				<VStack spacing={ 2 } alignment="flex-start">
					<HStack spacing={ 2 } justify="flex-start" expanded={ false }>
						{ buttons }
					</HStack>
					{ preview }
				</VStack>
			) : (
				<ButtonStack style={ { justifyContent: 'flex-start' } }>
					{ buttons }
					{ preview }
				</ButtonStack>
			) }
			{ isPreviewOpen && (
				<Modal
					title={ __( 'Preview referral email' ) }
					onRequestClose={ () => setIsPreviewOpen( false ) }
					size="medium"
				>
					<ReferralEmailPreview
						items={ items }
						term={ term }
						message={ message }
						logo={ previewLogo }
						agencyName={ agency?.name ?? __( 'Your agency' ) }
						email={ email }
					/>
				</Modal>
			) }
		</VStack>
	);
}

// The email the client gets. Main renders it on the server from the same
// inputs (logo, message, products, link); this is the same content laid out
// plainly, so the form's choices can be seen doing something.
function ReferralEmailPreview( {
	items,
	term,
	message,
	logo,
	agencyName,
	email,
}: {
	items: CheckoutLine[];
	term: 'monthly' | 'yearly';
	message: string;
	logo: string | null;
	agencyName: string;
	email: string;
} ) {
	const total = items.reduce( ( sum, item ) => sum + item.total, 0 );
	return (
		<div className="marketplace-checkout__email">
			<div className="marketplace-checkout__email-meta">
				<Text variant="muted" size={ 12 }>
					{ sprintf(
						/* translators: %s is the client's email address */
						__( 'To: %s' ),
						email || __( 'client@example.com' )
					) }
				</Text>
				<Text variant="muted" size={ 12 }>
					{ sprintf(
						/* translators: %s is the agency name */
						__( 'Subject: %s has sent you an order to review' ),
						agencyName
					) }
				</Text>
			</div>
			<div className="marketplace-checkout__email-body">
				<VStack spacing={ 6 }>
					{ logo ? (
						<img src={ logo } alt={ agencyName } className="marketplace-checkout__email-logo" />
					) : (
						<Heading level={ 2 } size={ 20 }>
							{ agencyName }
						</Heading>
					) }
					<Text size={ 16 }>
						{ sprintf(
							/* translators: %s is the agency name */
							__(
								'%s has put together the following order for you. Review it and pay when you are ready.'
							),
							agencyName
						) }
					</Text>
					{ message && (
						<blockquote className="marketplace-checkout__email-message">{ message }</blockquote>
					) }
					<VStack spacing={ 2 }>
						{ items.map( ( item ) => (
							<HStack key={ item.label } justify="space-between">
								<Text>{ item.label }</Text>
								<Text>{ formatUSD( item.total ) + suffix( term ) }</Text>
							</HStack>
						) ) }
						<CardDivider />
						<HStack justify="space-between">
							<Text weight={ 600 }>{ __( 'Total' ) }</Text>
							<Text weight={ 600 }>{ formatUSD( total ) + suffix( term ) }</Text>
						</HStack>
					</VStack>
					<div>
						<Button variant="primary" __next40pxDefaultSize>
							{ __( 'Review and pay' ) }
						</Button>
					</div>
					<Text variant="muted" size={ 12 }>
						{ __(
							'This link is valid for 14 days. You will create a WordPress.com account during checkout and receive a receipt by email.'
						) }
					</Text>
				</VStack>
			</div>
		</div>
	);
}

function HandOff( { state }: { state: CheckoutState } ) {
	return (
		<Card>
			<CardBody>
				<VStack spacing={ 4 }>
					<Heading level={ 2 } size={ 20 }>
						{ __( 'Payment' ) }
					</Heading>
					<Text variant="muted">
						{ __(
							'Payment is handled by WordPress.com checkout. You come back to the dashboard when it is done.'
						) }
					</Text>
					<ButtonStack style={ { justifyContent: 'flex-start' } }>
						<Button
							variant="primary"
							__next40pxDefaultSize
							onClick={ () => {
								// wordpress.com/checkout/ on its own is site-scoped and opens a
								// site picker; the prototype's wordpress.com agency page stands in
								// for the siteless agency checkout that would need to exist.
								const params = new URLSearchParams( window.location.search );
								params.set( 'checkout', 'dotcom' );
								window.location.assign( '/marketplace/checkout?' + params.toString() );
							} }
						>
							{ __( 'Continue to payment' ) }
						</Button>
						<Button variant="tertiary" __next40pxDefaultSize href="/marketplace/products">
							{ __( 'Back to Marketplace' ) }
						</Button>
					</ButtonStack>
					<Text variant="muted" size={ 12 }>
						{ sprintf(
							/* translators: %d: number of items */
							__( '%d items in this order.' ),
							state.items.length
						) }
					</Text>
				</VStack>
			</CardBody>
		</Card>
	);
}

// Option A, what Main does today: the WordPress.com checkout rendered inside
// the dashboard page. Built to match Main's live page (client/my-sites/checkout
// with sitelessCheckoutType="a4a"): three completed steps on the left (Your
// order, Billing information, Payment method), the Summary rail on the right
// with Complete Checkout, and the Automattic Inc. footer. The live one cannot
// run outside Calypso's app, so this is a faithful copy, not a design of ours.
function StepHeading( {
	title,
	editing,
	onEdit,
}: {
	title: string;
	editing?: boolean;
	onEdit?: () => void;
} ) {
	return (
		<HStack justify="space-between" className="marketplace-checkout__step-heading">
			<HStack spacing={ 3 } justify="flex-start" expanded={ false }>
				<span className="marketplace-checkout__step-check">
					<Icon icon={ check } size={ 20 } />
				</span>
				<Heading level={ 2 } size={ 20 } weight={ 400 }>
					{ title }
				</Heading>
			</HStack>
			{ onEdit && ! editing && (
				<Button variant="link" className="marketplace-checkout__edit" onClick={ onEdit }>
					{ __( 'Edit' ) }
				</Button>
			) }
		</HStack>
	);
}

// Main's steps reopen in place when you click Edit and close again on
// Continue. Billing asks for country and postal code; Payment method lists the
// saved card, a new card and PayPal.
function BillingStep() {
	const [ editing, setEditing ] = useState( false );
	return (
		<VStack spacing={ 6 }>
			<StepHeading
				title={ __( 'Billing information' ) }
				editing={ editing }
				onEdit={ () => setEditing( true ) }
			/>
			<div className="marketplace-checkout__step-body">
				{ editing ? (
					<VStack spacing={ 4 } className="marketplace-checkout__form">
						<TextControl
							__nextHasNoMarginBottom
							__next40pxDefaultSize
							label={ __( 'Country' ) }
							value="Iceland"
							onChange={ () => {} }
						/>
						<TextControl
							__nextHasNoMarginBottom
							__next40pxDefaultSize
							label={ __( 'Postal code' ) }
							value="107"
							onChange={ () => {} }
						/>
						<ButtonStack style={ { justifyContent: 'flex-start' } }>
							<Button variant="primary" __next40pxDefaultSize onClick={ () => setEditing( false ) }>
								{ __( 'Continue' ) }
							</Button>
						</ButtonStack>
					</VStack>
				) : (
					<Text variant="muted">{ __( '107, IS' ) }</Text>
				) }
			</div>
		</VStack>
	);
}

function SavedCard() {
	return (
		<HStack spacing={ 3 } justify="flex-start" expanded={ false }>
			<span className="marketplace-checkout__card-brand" aria-hidden="true">
				<i />
				<i />
			</span>
			<Text variant="muted">**** 3110</Text>
			<Text variant="muted">{ __( 'Expiry: 09/29' ) }</Text>
		</HStack>
	);
}

function PaymentStep() {
	const [ editing, setEditing ] = useState( false );
	const [ method, setMethod ] = useState( 'saved' );
	return (
		<VStack spacing={ 6 }>
			<StepHeading
				title={ __( 'Payment method' ) }
				editing={ editing }
				onEdit={ () => setEditing( true ) }
			/>
			<div className="marketplace-checkout__step-body">
				{ editing ? (
					<VStack spacing={ 4 } className="marketplace-checkout__form">
						<RadioControl
							selected={ method }
							options={ [
								{ label: __( 'Mastercard **** 3110, expires 09/29' ), value: 'saved' },
								{ label: __( 'Credit or debit card' ), value: 'card' },
								{ label: __( 'PayPal' ), value: 'paypal' },
							] }
							onChange={ setMethod }
						/>
						{ method === 'card' && (
							<VStack spacing={ 3 }>
								<TextControl
									__nextHasNoMarginBottom
									__next40pxDefaultSize
									label={ __( 'Cardholder name' ) }
									value=""
									onChange={ () => {} }
								/>
								<TextControl
									__nextHasNoMarginBottom
									__next40pxDefaultSize
									label={ __( 'Card number' ) }
									placeholder="1234 1234 1234 1234"
									value=""
									onChange={ () => {} }
								/>
								<HStack spacing={ 3 }>
									<TextControl
										__nextHasNoMarginBottom
										__next40pxDefaultSize
										label={ __( 'Expiry date' ) }
										placeholder="MM / YY"
										value=""
										onChange={ () => {} }
									/>
									<TextControl
										__nextHasNoMarginBottom
										__next40pxDefaultSize
										label={ __( 'Security code' ) }
										placeholder="CVC"
										value=""
										onChange={ () => {} }
									/>
								</HStack>
							</VStack>
						) }
						<ButtonStack style={ { justifyContent: 'flex-start' } }>
							<Button variant="primary" __next40pxDefaultSize onClick={ () => setEditing( false ) }>
								{ __( 'Continue' ) }
							</Button>
						</ButtonStack>
					</VStack>
				) : (
					<VStack spacing={ 1 }>
						<Text variant="muted">{ __( 'Noam Almosnino' ) }</Text>
						<SavedCard />
					</VStack>
				) }
			</div>
		</VStack>
	);
}

function EmbeddedDotcomCheckout( { state }: { state: CheckoutState } ) {
	const total = state.items.reduce( ( sum, item ) => sum + item.total, 0 );
	const billed = state.term === 'yearly' ? __( 'Billed annually' ) : __( 'Billed monthly' );
	const termLabel = state.term === 'yearly' ? __( 'One year' ) : __( 'One month' );
	return (
		<div className="marketplace-checkout__dotcom">
			<Grid templateColumns="minmax( 0, 1fr ) 360px" gap={ 10 } alignment="top">
				<VStack spacing={ 10 } className="marketplace-checkout__steps">
					<VStack spacing={ 6 }>
						<StepHeading title={ __( 'Your order' ) } />
						<div className="marketplace-checkout__step-body">
							<VStack spacing={ 8 }>
								<Text variant="muted">{ __( 'Account: agency@example.com' ) }</Text>
								{ state.items.map( ( item ) => (
									<VStack key={ item.label } spacing={ 4 }>
										<HStack justify="space-between" alignment="top">
											<VStack spacing={ 1 }>
												<Text size={ 16 } weight={ 500 }>
													{ item.label }
												</Text>
												<Text variant="muted">{ billed }</Text>
											</VStack>
											<Text size={ 16 }>{ formatUSD( item.total ) }</Text>
										</HStack>
										<button type="button" className="marketplace-checkout__term">
											<span>{ termLabel }</span>
											<span className="marketplace-checkout__term-price">
												{ formatUSD( item.total ) }
											</span>
											<Icon icon={ chevronDown } size={ 24 } />
										</button>
									</VStack>
								) ) }
							</VStack>
						</div>
					</VStack>
					<BillingStep />
					<PaymentStep />
					<Text variant="muted" align="center" className="marketplace-checkout__footer">
						{ __( 'Your payment will be processed by Automattic Inc.' ) }
					</Text>
				</VStack>
				<Card className="marketplace-checkout__summary">
					<CardBody>
						<VStack spacing={ 4 }>
							<Heading level={ 2 } size={ 20 } weight={ 400 }>
								{ __( 'Summary' ) }
							</Heading>
							<VStack spacing={ 2 }>
								{ state.items.map( ( item ) => (
									<HStack key={ item.label } justify="space-between">
										<HStack spacing={ 2 } justify="flex-start" expanded={ false }>
											<Icon
												icon={ check }
												size={ 20 }
												className="marketplace-checkout__summary-check"
											/>
											<Text>{ item.label }</Text>
										</HStack>
										<Text>{ formatUSD( item.total ) }</Text>
									</HStack>
								) ) }
							</VStack>
							<CardDivider />
							<HStack justify="space-between">
								<Text size={ 18 }>{ __( 'Subtotal' ) }</Text>
								<Text size={ 16 }>{ formatUSD( total ) }</Text>
							</HStack>
							<CardDivider />
							<HStack justify="space-between">
								<Text size={ 18 }>{ __( 'Total' ) }</Text>
								<Text size={ 22 }>{ formatUSD( total ) }</Text>
							</HStack>
							<Button
								variant="primary"
								__next40pxDefaultSize
								className="marketplace-checkout__complete"
							>
								{ __( 'Complete Checkout' ) }
							</Button>
							<VStack spacing={ 2 }>
								<HStack spacing={ 2 } justify="flex-start" expanded={ false }>
									<Icon icon={ lock } size={ 16 } className="marketplace-checkout__seal-icon" />
									<Text variant="muted">{ __( 'SSL secure payment · 256-bit encryption' ) }</Text>
								</HStack>
								<HStack spacing={ 2 } justify="flex-start" expanded={ false }>
									<Icon
										icon={ reusableBlock }
										size={ 20 }
										className="marketplace-checkout__seal-icon"
									/>
									<Text size={ 16 } variant="muted">
										{ __( '14-day money back guarantee' ) }
									</Text>
								</HStack>
							</VStack>
							<CardDivider />
							<Text variant="muted" size={ 12 }>
								{ __( 'By purchasing, you accept the ' ) }
								<a href="#terms">{ __( 'Terms of Service' ) }</a>
								{ __( ' and ' ) }
								<a href="#privacy">{ __( 'Privacy Policy' ) }</a>
								{ '. ' }
								<a href="#billing">{ __( 'View billing and renewal details' ) }</a>
							</Text>
						</VStack>
					</CardBody>
				</Card>
			</Grid>
		</div>
	);
}

// Direction D, the dotcom dashboard's way: the cart leaves the dashboard for
// a wordpress.com page. wordpress.com already has one agency checkout page,
// /checkout/agency/referral (the client-pays referral flow), whose masthead is
// the Automattic wordmark and "Secure checkout" (client/layout/masterbar/
// checkout.tsx, checkoutType 'a4a'). This copies that shell around the same
// checkout body. There is no purchase route like it yet; that is the ask.
function DotcomCheckoutPage( { state }: { state: CheckoutState } ) {
	return (
		<div className="marketplace-checkout__dotcom-page">
			<header className="marketplace-checkout__masthead">
				<AutomatticWordmark />
				<span>{ __( 'Secure checkout' ) }</span>
			</header>
			<main>
				{ state.referral ? (
					// The agency's request form on the same wordpress.com page as
					// purchases, so both checkouts leave the dashboard the same way.
					// Main keeps this form in the dashboard; wordpress.com has no page
					// for it today either, only the client's side of the referral.
					<div className="marketplace-checkout__dotcom">
						<Grid templateColumns="minmax( 0, 1fr ) 360px" gap={ 10 } alignment="top">
							<VStack spacing={ 6 }>
								<StepHeading title={ __( 'Request client payment' ) } />
								<div className="marketplace-checkout__step-body">
									<ReferralRequestForm
										items={ state.items }
										term={ state.term }
										onSent={ finishReferral }
									/>
								</div>
							</VStack>
							<Summary state={ state } compact />
						</Grid>
					</div>
				) : (
					<EmbeddedDotcomCheckout state={ state } />
				) }
			</main>
		</div>
	);
}

// The current monochrome Automattic wordmark (from Noam, Sept 22, 2026),
// standing in for the old one Main's masthead still renders; see the logo
// sweep issue in A4AD.
function AutomatticWordmark() {
	return (
		<svg height={ 14 } viewBox="0 0 2103 157" aria-label="Automattic" role="img">
			<path
				d="M752.203 0.157631C804.851 0.157631 838.9 34.8363 838.9 77.8695C838.9 119.957 805.167 155.424 752.203 155.424C699.554 155.424 665.821 120.272 665.821 77.8695C665.821 34.8363 699.554 0.157631 752.203 0.157631ZM264.189 90.6376C264.189 117.75 281.843 133.671 315.734 133.671C349.624 133.671 364.757 117.75 364.757 90.6376V4.57129H392.185V90.3223C392.185 126.577 368.855 157 313.842 157C258.829 157 236.761 128.469 236.761 90.3223V4.57129H264.189V90.6376ZM182.063 150.695L182.379 151.01H153.059L133.671 114.755H47.9197L29.004 151.01H0L78.9729 4.57129H101.672L182.063 150.695ZM615.862 27.2701L615.547 27.5853H551.707V151.01H524.437V27.5853H460.596V4.57129H615.862V27.2701ZM948.404 4.57129L1013.19 117.119L1076.71 4.57129H1114.39V151.01H1086.96V35.3092L1018.55 151.01H1005.15L937.369 35.3092V151.01H910.572V4.57129H948.404ZM1357.77 150.695V151.01H1328.29L1308.9 114.755H1223.15L1204.4 151.01H1175.23L1254.52 4.57129H1277.38L1357.77 150.695ZM1547.24 27.2701L1546.93 27.5853H1483.09V151.01H1455.82V27.5853H1391.82V4.57129H1547.24V27.2701ZM1763.83 27.2701L1763.51 27.5853H1699.67V151.01H1672.4V27.5853H1608.56V4.57129H1763.83V27.2701ZM1861.24 151.01H1834.29V18.4428C1845.01 18.4428 1849.58 12.4528 1849.58 4.57129H1861.24V151.01ZM752.203 23.0141C713.741 23.0141 693.564 48.0773 693.564 77.5542C693.564 107.189 714.056 132.567 752.203 132.567C790.349 132.567 811.157 107.189 811.157 77.5542C811.157 48.0773 790.665 23.0141 752.203 23.0141ZM755.04 52.6486C758.193 47.762 764.813 46.3434 769.542 49.496C774.429 52.6486 775.847 59.2691 772.695 63.998L747.632 102.775C744.479 107.662 738.016 109.08 733.13 105.928C728.243 102.775 726.036 96.3122 729.977 91.4257L755.04 52.6486ZM57.8504 94.5783H122.794L89.8494 32.9448L57.8504 94.5783ZM1233.4 94.5783H1298.34L1265.4 32.9448L1233.4 94.5783ZM1959.6 77.7118C1959.6 110.814 1983.56 132.252 2021.55 132.252C2044.25 132.252 2062.54 124.37 2081.61 105.612L2098.16 122.637C2078.77 145.02 2051.34 155.424 2021.55 155.424C1968.9 155.424 1931.86 122.637 1931.86 77.7118C1931.86 32.7871 1968.9 0 2021.55 0C2051.34 0 2078.77 10.4036 2098.16 32.7871L2081.61 49.8112C2062.54 31.0532 2044.25 23.1717 2021.55 23.1717C1983.56 23.1717 1959.6 44.6094 1959.6 77.7118Z"
				fill="currentColor"
			/>
		</svg>
	);
}

// The dashboard's breadcrumb (app/breadcrumbs) builds its trail from the
// route's parents. Checkout hangs off the agency root like Products does, so
// it has no "Marketplace" parent to read; the same component gets the two
// crumbs explicitly instead.
function CheckoutBreadcrumbs( { title }: { title: string } ) {
	return (
		<Breadcrumbs
			items={ [
				{ label: __( 'Marketplace' ), href: '/marketplace/products' },
				{ label: title, href: '/marketplace/checkout' },
			] }
			renderItemLink={ ( { href, label, ...rest } ) => (
				<Link to={ href } { ...rest }>
					{ label }
				</Link>
			) }
		/>
	);
}

// After a referral is created, Main clears the cart and goes to Referrals
// with a banner naming the client. Same here: the stashed cart and the page
// carts are emptied, then the Referrals page reads the banner from the URL.
function finishReferral( flow: 'send' | 'copy', email: string, link: string ) {
	try {
		window.sessionStorage.removeItem( CHECKOUT_STORAGE_KEY );
		window.sessionStorage.setItem( 'a4a-proto-cart-products', '[]' );
		window.sessionStorage.setItem( 'a4a-proto-cart-hosting', '[]' );
	} catch {
		// prototype only
	}
	const params = new URLSearchParams( {
		referral_email: email,
		referral_flow: flow,
		referral_link: link,
	} );
	window.location.assign( '/earn/referrals?' + params.toString() );
}

export default function MarketplaceCheckout() {
	const state = readCheckout();
	const variant = new URLSearchParams( window.location.search ).get( 'checkout' ) ?? 'a';
	const title = state.referral ? __( 'Referral checkout' ) : __( 'Checkout' );

	if ( variant === 'dotcom' ) {
		return <DotcomCheckoutPage state={ state } />;
	}

	// A, what Main does today: the WordPress.com checkout inside the dashboard
	// page for purchases; the request-payment page (Main's V1) for referrals.
	if ( variant === 'a' ) {
		return (
			<PageLayout
				header={
					<PageHeader
						prefix={ <CheckoutBreadcrumbs title={ title } /> }
						title={ title }
						description={
							state.referral
								? __(
										'Send your client a link to pay. Once they do, the products are theirs and the commission is yours.'
								  )
								: undefined
						}
					/>
				}
			>
				{ state.referral ? (
					<Grid templateColumns="minmax( 0, 1fr ) 360px" gap={ 8 } alignment="top">
						<Card>
							<CardHeader>
								<SectionHeader level={ 2 } title={ __( 'Request client payment' ) } />
							</CardHeader>
							<CardBody>
								<ReferralRequestForm
									items={ state.items }
									term={ state.term }
									onSent={ finishReferral }
								/>
							</CardBody>
						</Card>
						<Summary state={ state } compact />
					</Grid>
				) : (
					<EmbeddedDotcomCheckout state={ state } />
				) }
			</PageLayout>
		);
	}

	// B: one review page for both. Items on the left, the action in the rail.
	if ( variant === 'b' ) {
		return (
			<PageLayout
				header={
					<PageHeader
						prefix={ <CheckoutBreadcrumbs title={ title } /> }
						title={ __( 'Review your order' ) }
					/>
				}
			>
				<Grid templateColumns="minmax( 0, 1fr ) 360px" gap={ 8 } alignment="top">
					<VStack spacing={ 6 }>
						<Summary state={ state } />
						{ state.referral && (
							<Card>
								<CardHeader>
									<SectionHeader level={ 2 } title={ __( 'Request client payment' ) } />
								</CardHeader>
								<CardBody>
									<ReferralRequestForm
										items={ state.items }
										term={ state.term }
										onSent={ finishReferral }
									/>
								</CardBody>
							</Card>
						) }
					</VStack>
					<Card>
						<CardBody>
							<VStack spacing={ 3 }>
								<Text weight={ 600 }>
									{ state.referral ? __( 'Ready to send?' ) : __( 'Ready to pay?' ) }
								</Text>
								<Text variant="muted" size={ 12 }>
									{ state.referral
										? __( 'Your client pays on WordPress.com from the link.' )
										: __( 'Payment runs on WordPress.com. You come back here after.' ) }
								</Text>
								{ ! state.referral && (
									<Button
										variant="primary"
										__next40pxDefaultSize
										href="https://wordpress.com/checkout/"
										target="_blank"
										rel="noreferrer"
									>
										{ __( 'Continue to payment' ) }
									</Button>
								) }
								<Button variant="tertiary" __next40pxDefaultSize href="/marketplace/products">
									{ __( 'Back to Marketplace' ) }
								</Button>
							</VStack>
						</CardBody>
					</Card>
				</Grid>
			</PageLayout>
		);
	}

	// C: the drawer did the referral work on the Products page; here only the
	// purchase hand-off remains.
	return (
		<PageLayout
			header={ <PageHeader prefix={ <CheckoutBreadcrumbs title={ title } /> } title={ title } /> }
		>
			<VStack spacing={ 4 }>
				<Notice variant="info">
					{ __(
						'In this direction the referral form lives in the cart drawer on Products. This page only handles purchases.'
					) }
				</Notice>
				<Grid templateColumns="minmax( 0, 1fr ) 360px" gap={ 8 } alignment="top">
					<HandOff state={ state } />
					<Summary state={ state } compact />
				</Grid>
			</VStack>
		</PageLayout>
	);
}
