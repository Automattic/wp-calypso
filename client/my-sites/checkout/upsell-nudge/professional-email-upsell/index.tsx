import { TITAN_MAIL_MONTHLY_SLUG, TITAN_MAIL_YEARLY_SLUG } from '@automattic/calypso-products';
import { Button, Gridicon } from '@automattic/components';
import formatCurrency from '@automattic/format-currency';
import { MOBILE_BREAKPOINT } from '@automattic/viewport';
import { useBreakpoint } from '@automattic/viewport-react';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import poweredByTitanLogo from 'calypso/assets/images/email-providers/titan/powered-by-titan-caps.svg';
import Badge from 'calypso/components/badge';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormInputValidation from 'calypso/components/forms/form-input-validation';
import FormLabel from 'calypso/components/forms/form-label';
import FormPasswordInput from 'calypso/components/forms/form-password-input';
import FormTextInputWithAffixes from 'calypso/components/forms/form-text-input-with-affixes';
import { titanMailMonthly, titanMailYearly } from 'calypso/lib/cart-values/cart-items';
import {
	areAllMailboxesValid,
	buildNewTitanMailbox,
	transformMailboxForCart,
	validateMailboxes,
} from 'calypso/lib/titan/new-mailbox';
import { BillingIntervalToggle } from 'calypso/my-sites/email/email-providers-comparison/billing-interval-toggle';
import { IntervalLength } from 'calypso/my-sites/email/email-providers-comparison/interval-length';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getProductCost } from 'calypso/state/products-list/selectors';
import type { MinimalRequestCartProduct } from '@automattic/shopping-cart';
import type { TitanProductProps } from 'calypso/lib/cart-values/cart-items';
import type { TranslateResult } from 'i18n-calypso';
import type { ChangeEvent } from 'react';

import './style.scss';

const ProfessionalEmailFeature = ( { children }: { children: TranslateResult } ) => {
	return (
		<li>
			<Gridicon icon="checkmark" size={ 18 } />
			<span>{ children }</span>
		</li>
	);
};

type ProfessionalEmailUpsellProps = {
	currencyCode: string;
	domainName: string;
	handleClickAccept: ( action: string ) => void;
	handleClickDecline: () => void;
	setCartItem: ( cartItem: MinimalRequestCartProduct, callback: () => void ) => void;
	intervalLength?: IntervalLength | undefined;
};

const ProfessionalEmailUpsell = ( {
	currencyCode,
	domainName,
	handleClickAccept,
	handleClickDecline,
	setCartItem,
	intervalLength = IntervalLength.ANNUALLY,
}: ProfessionalEmailUpsellProps ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const [ selectedIntervalLength, setSelectedIntervalLength ] = useState( intervalLength );

	const productCost = useSelector( ( state ) => {
		if ( selectedIntervalLength === IntervalLength.ANNUALLY ) {
			return getProductCost( state, TITAN_MAIL_YEARLY_SLUG );
		}

		return getProductCost( state, TITAN_MAIL_MONTHLY_SLUG );
	} );

	const isMobileView = useBreakpoint( MOBILE_BREAKPOINT );

	const [ mailboxData, setMailboxData ] = useState( buildNewTitanMailbox( domainName, false ) );
	const [ showAllErrors, setShowAllErrors ] = useState( false );

	const [ mailboxFieldTouched, setMailboxFieldTouched ] = useState( false );
	const [ passwordFieldTouched, setPasswordFieldTouched ] = useState( false );

	const hasMailboxError =
		( mailboxFieldTouched || showAllErrors ) && null !== mailboxData.mailbox.error;
	const hasPasswordError =
		( passwordFieldTouched || showAllErrors ) && null !== mailboxData.password.error;

	const hasBeenValidated = [ mailboxData.mailbox, mailboxData.password ].some(
		( { error, value } ) => null !== error || '' !== value
	);

	const optionalMailboxFields = [ 'alternativeEmail', 'name' ];

	const changeIntervalLength = ( newIntervalLength: IntervalLength ) => {
		setSelectedIntervalLength( newIntervalLength );
		dispatch(
			recordTracksEvent( 'calypso_professional_email_upsell_nudge_billing_interval_toggle_click', {
				domain_name: domainName,
				new_interval: newIntervalLength,
			} )
		);
	};

	function addMonths( date: Date, months: number ) {
		const d = date.getDate();
		date.setMonth( date.getMonth() + months );
		if ( date.getDate() !== d ) {
			date.setDate( 0 );
		}
		return date;
	}

	/**
	 * We calculate the price for a year subscription, given how many months we are going to offer for free.
	 * It takes into account leap years, and months like february.
	 *
	 * Example: If we give 3 months for free in February, for a product that cost 35$ yearly then we return the price
	 * that we need to bill after those 3 months for the rest of the year.
	 *
	 * @param productCost
	 * @param freeMonths
	 */
	const getProratedPrice = ( productCost: number, freeMonths: number ) => {
		const now = new Date();
		const freeTime = addMonths( new Date(), freeMonths ).getTime();
		const nextYearDate = addMonths( new Date(), 12 );
		const diff = nextYearDate.getTime() - freeTime;
		const diffDays = ( nextYearDate.getTime() - now.getTime() ) / 86400000 - diff / 86400000;
		const price = ( 365 - Math.round( diffDays ) ) / 365;
		return price * productCost;
	};

	const getFormattedPrice = (
		currencyCode: string,
		intervalLength: IntervalLength,
		productCost: number
	): TranslateResult => {
		if ( intervalLength === IntervalLength.MONTHLY ) {
			return translate( '{{price/}} /mailbox /month', {
				components: {
					price: <span>{ formatCurrency( productCost ?? 0, currencyCode ) }</span>,
				},
				comment: '{{price/}} is the formatted price, e.g. $20',
			} );
		}
		const proratedPrice = getProratedPrice( productCost, 3 );
		return translate( '{{price/}} /mailbox /year', {
			components: {
				price: <span>{ formatCurrency( proratedPrice, currencyCode ) }</span>,
			},
			comment: '{{price/}} is the formatted price, e.g. $20',
		} );
	};

	const formattedPrice = getFormattedPrice(
		currencyCode,
		selectedIntervalLength,
		productCost ?? 0
	);

	const onMailboxValueChange = ( fieldName: string, fieldValue: string | null ) => {
		const updatedMailboxData = {
			...mailboxData,
			[ fieldName ]: { value: fieldValue, error: null },
		};
		const validatedMailboxData = validateMailboxes(
			[ updatedMailboxData ],
			optionalMailboxFields
		).pop();

		if ( validatedMailboxData ) {
			setMailboxData( validatedMailboxData );
		}
	};

	const handleAddEmail = () => {
		setShowAllErrors( true );

		const validatedTitanMailboxes = validateMailboxes( [ mailboxData ], optionalMailboxFields );

		const mailboxesAreValid = areAllMailboxesValid(
			validatedTitanMailboxes,
			optionalMailboxFields
		);

		setMailboxData( validatedTitanMailboxes[ 0 ] );

		if ( ! mailboxesAreValid ) {
			return;
		}

		const cartItemArgs: TitanProductProps = {
			domain: domainName,
			quantity: validatedTitanMailboxes.length,
			extra: {
				email_users: validatedTitanMailboxes.map( transformMailboxForCart ),
				new_quantity: validatedTitanMailboxes.length,
			},
		};

		const cartItem =
			selectedIntervalLength === IntervalLength.MONTHLY
				? titanMailMonthly( cartItemArgs )
				: titanMailYearly( cartItemArgs );

		setCartItem( cartItem, () => handleClickAccept( 'accept' ) );
	};

	const threeMonthsFreeBadge = (
		<span>
			<Badge type="success">{ translate( '3 months free' ) }</Badge>
		</span>
	);

	const pricingComponent = (
		<div className="professional-email-upsell__pricing">
			{ threeMonthsFreeBadge }
			<span
				className={ classNames( 'professional-email-upsell__standard-price', {
					'is-discounted': true,
				} ) }
			>
				{ formattedPrice }
			</span>
		</div>
	);

	return (
		<div>
			<header className="professional-email-upsell__header notouch">
				<h3 className="professional-email-upsell__small-title">
					{ translate( "Hold tight, we're getting your site ready." ) }
				</h3>
				<h1 className="professional-email-upsell__title wp-brand-font">
					{ translate( 'Add Professional Email @%(domain)s', {
						args: {
							domain: domainName,
						},
						comment: '%(domain)s is a domain name, like example.com',
					} ) }
				</h1>
				<h3 className="professional-email-upsell__small-subtitle">
					{ translate( 'No setup required. Easy to manage.' ) }
				</h3>
				<BillingIntervalToggle
					intervalLength={ selectedIntervalLength }
					onIntervalChange={ changeIntervalLength }
				/>
			</header>
			<div className="professional-email-upsell__content">
				{ isMobileView && pricingComponent }
				<div className="professional-email-upsell__form">
					<FormFieldset>
						<FormLabel>
							{ translate( 'Enter email address' ) }
							<FormTextInputWithAffixes
								value={ mailboxData.mailbox.value }
								isError={ hasMailboxError }
								onChange={ ( event: ChangeEvent< HTMLInputElement > ) => {
									onMailboxValueChange( 'mailbox', event.target.value.toLowerCase() );
								} }
								onBlur={ () => {
									setMailboxFieldTouched( hasBeenValidated );
								} }
								suffix={ `@${ domainName }` }
							/>
						</FormLabel>
						{ hasMailboxError && (
							<FormInputValidation text={ mailboxData.mailbox.error } isError />
						) }
					</FormFieldset>
					<FormFieldset>
						<FormLabel>
							{ translate( 'Set password' ) }
							<FormPasswordInput
								autoCapitalize="off"
								autoCorrect="off"
								value={ mailboxData.password.value }
								maxLength={ 100 }
								isError={ hasPasswordError }
								onChange={ ( event: ChangeEvent< HTMLInputElement > ) => {
									onMailboxValueChange( 'password', event.target.value );
								} }
								onBlur={ () => {
									setPasswordFieldTouched( hasBeenValidated );
								} }
							/>
						</FormLabel>
						{ hasPasswordError && (
							<FormInputValidation text={ mailboxData.password.error } isError />
						) }
					</FormFieldset>
					<div className="professional-email-upsell__form-buttons">
						<Button onClick={ handleClickDecline }>{ translate( 'Skip for now' ) }</Button>
						<Button primary={ true } onClick={ handleAddEmail }>
							{ translate( 'Add Professional Email' ) }
						</Button>
					</div>
				</div>
				<div className="professional-email-upsell__features">
					{ ! isMobileView && pricingComponent }
					<h2>{ translate( 'Why get Professional Email?' ) }</h2>
					<ul className="professional-email-upsell__feature-list">
						<ProfessionalEmailFeature>
							{ translate( "Trusted email address that's truly yours" ) }
						</ProfessionalEmailFeature>
						<ProfessionalEmailFeature>
							{ translate( 'Increase your credibility' ) }
						</ProfessionalEmailFeature>
						<ProfessionalEmailFeature>
							{ translate( 'Build your brand with every email you send' ) }
						</ProfessionalEmailFeature>
						<ProfessionalEmailFeature>
							{ translate( 'Reach your recipients’ primary inbox' ) }
						</ProfessionalEmailFeature>
					</ul>
					<img
						className="professional-email-upsell__titan-logo"
						src={ poweredByTitanLogo }
						alt={ translate( 'Powered by Titan', { textOnly: true } ) }
					/>
				</div>
			</div>
		</div>
	);
};

export default ProfessionalEmailUpsell;
