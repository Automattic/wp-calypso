import { TITAN_MAIL_MONTHLY_SLUG } from '@automattic/calypso-products';
import { Button, Gridicon } from '@automattic/components';
import formatCurrency from '@automattic/format-currency';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
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
	productCost?: number | null;
	productSlug: string;
	setCartItem: ( cartItem: MinimalRequestCartProduct, callback: () => void ) => void;
};

const ProfessionalEmailUpsell = ( {
	currencyCode,
	domainName,
	handleClickAccept,
	handleClickDecline,
	productCost,
	productSlug,
	setCartItem,
}: ProfessionalEmailUpsellProps ) => {
	const translate = useTranslate();

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

	const resolveFormattedPrice = (
		currencyCode: string,
		productCost: number,
		productSlug: string
	): TranslateResult => {
		if ( productSlug === TITAN_MAIL_MONTHLY_SLUG ) {
			return translate( '{{price/}} /mailbox /month', {
				components: {
					price: <span>{ formatCurrency( productCost ?? 0, currencyCode ) }</span>,
				},
				comment: '{{price/}} is the formatted price, e.g. $20',
			} );
		}
		return translate( '{{price/}} /mailbox /year', {
			components: {
				price: <span>{ formatCurrency( productCost ?? 0, currencyCode ) }</span>,
			},
			comment: '{{price/}} is the formatted price, e.g. $20',
		} );
	};

	const formattedPrice = resolveFormattedPrice( currencyCode, productCost ?? 0, productSlug );

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

	const resolveTitanMailProduct = (
		productSlug: string
	): ( ( properties: TitanProductProps ) => MinimalRequestCartProduct ) => {
		if ( productSlug === TITAN_MAIL_MONTHLY_SLUG ) {
			return titanMailMonthly;
		}
		return titanMailYearly;
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
		const titanMailProduct = resolveTitanMailProduct( productSlug );
		const cartItem = titanMailProduct( {
			domain: domainName,
			quantity: validatedTitanMailboxes.length,
			extra: {
				email_users: validatedTitanMailboxes.map( transformMailboxForCart ),
				new_quantity: validatedTitanMailboxes.length,
			},
		} );

		setCartItem( cartItem, () => handleClickAccept( 'accept' ) );
	};

	return (
		<div>
			<header className="professional-email-upsell__header">
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
				<div className="professional-email-upsell__pricing">
					<span
						className={ classNames( 'professional-email-upsell__standard-price', {
							'is-discounted': true,
						} ) }
					>
						{ formattedPrice }
					</span>

					<span>
						<Badge type="success">{ translate( '3 months free' ) }</Badge>
					</span>
				</div>
			</header>
			<div className="professional-email-upsell__content">
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
