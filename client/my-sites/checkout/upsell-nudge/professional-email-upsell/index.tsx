import { TITAN_MAIL_MONTHLY_SLUG, TITAN_MAIL_YEARLY_SLUG } from '@automattic/calypso-products';
import { Gridicon } from '@automattic/components';
import formatCurrency from '@automattic/format-currency';
import { MOBILE_BREAKPOINT } from '@automattic/viewport';
import { useBreakpoint } from '@automattic/viewport-react';
import classNames from 'classnames';
import i18n, { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import poweredByTitanLogo from 'calypso/assets/images/email-providers/titan/powered-by-titan-caps.svg';
import Badge from 'calypso/components/badge';
import { titanMailMonthly, titanMailYearly } from 'calypso/lib/cart-values/cart-items';
import { BillingIntervalToggle } from 'calypso/my-sites/email/email-providers-comparison/billing-interval-toggle';
import { IntervalLength } from 'calypso/my-sites/email/email-providers-comparison/interval-length';
import { MailboxForm } from 'calypso/my-sites/email/form/mailboxes';
import { NewMailBoxList } from 'calypso/my-sites/email/form/mailboxes/components/new-mailbox-list';
import { MailboxOperations } from 'calypso/my-sites/email/form/mailboxes/components/utilities/mailbox-operations';
import {
	FIELD_ALTERNATIVE_EMAIL,
	FIELD_MAILBOX,
	FIELD_NAME,
	FIELD_PASSWORD,
} from 'calypso/my-sites/email/form/mailboxes/constants';
import { EmailProvider } from 'calypso/my-sites/email/form/mailboxes/types';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getProductCost } from 'calypso/state/products-list/selectors';
import type { MinimalRequestCartProduct } from '@automattic/shopping-cart';
import type { TranslateResult } from 'i18n-calypso';

import './style.scss';

const ProfessionalEmailFeature = ( { children }: { children: TranslateResult } ) => {
	return (
		<li>
			<Gridicon icon="checkmark" size={ 18 } />
			<span>{ children }</span>
		</li>
	);
};

const getCartItems = (
	mailboxes: MailboxForm< EmailProvider >[],
	selectedIntervalLength: IntervalLength
) => {
	const email_users = mailboxes.map( ( mailbox ) => mailbox.getAsCartItem() );

	const cartItemFunction =
		selectedIntervalLength === IntervalLength.MONTHLY ? titanMailMonthly : titanMailYearly;

	return cartItemFunction( {
		domain: mailboxes[ 0 ].formFields.domain.value,
		quantity: email_users.length,
		extra: {
			email_users,
			new_quantity: email_users.length,
		},
	} );
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

	const changeIntervalLength = ( newIntervalLength: IntervalLength ) => {
		setSelectedIntervalLength( newIntervalLength );
		dispatch(
			recordTracksEvent( 'calypso_professional_email_upsell_nudge_billing_interval_toggle_click', {
				domain_name: domainName,
				new_interval: newIntervalLength,
			} )
		);
	};

	const getFormattedPrice = (
		currencyCode: string,
		intervalLength: IntervalLength,
		productCost: number
	): TranslateResult => {
		const translateOptions = {
			components: {
				price: (
					<span className="professional-email-upsell__discounted">
						{ formatCurrency( productCost ?? 0, currencyCode ) }
					</span>
				),
			},
			comment: '{{price/}} is the formatted price, e.g. $20',
		};
		if ( intervalLength === IntervalLength.MONTHLY ) {
			return translate( '{{price/}} /mailbox /month', translateOptions );
		}

		return translate( '{{price/}} /mailbox /year', translateOptions );
	};

	const formattedPrice = getFormattedPrice(
		currencyCode,
		selectedIntervalLength,
		productCost ?? 0
	);

	const onSubmit = async ( mailboxOperations: MailboxOperations ) => {
		if ( ! ( await mailboxOperations.validateAndCheck( false ) ) ) {
			return;
		}

		setCartItem( getCartItems( mailboxOperations.mailboxes, selectedIntervalLength ), () =>
			handleClickAccept( 'accept' )
		);
	};

	const pricingComponent = (
		<div className="professional-email-upsell__pricing">
			<span>
				<Badge type="success">{ translate( '3 months free' ) }</Badge>
			</span>
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
			<header className="professional-email-upsell__header">
				<h3 className="professional-email-upsell__small-title">
					{ translate( "Hold tight, we're getting things ready." ) }
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
					{ i18n.hasTranslation( 'No setup required. Easy to manage.' )
						? translate( 'No setup required. Easy to manage.' )
						: null }
				</h3>
				<BillingIntervalToggle
					intervalLength={ selectedIntervalLength }
					onIntervalChange={ changeIntervalLength }
				/>
			</header>
			<div className="professional-email-upsell__content">
				{ isMobileView && pricingComponent }
				<div className="professional-email-upsell__form">
					<NewMailBoxList
						cancelActionText={ translate( 'Skip for now' ) }
						fieldLabelTexts={ {
							[ FIELD_MAILBOX ]: translate( 'Enter email address' ),
							[ FIELD_PASSWORD ]: translate( 'Set password' ),
						} }
						hiddenFieldNames={ [ FIELD_NAME, FIELD_ALTERNATIVE_EMAIL ] }
						isInitialMailboxPurchase
						onCancel={ handleClickDecline }
						onSubmit={ onSubmit }
						provider={ EmailProvider.Titan }
						selectedDomainName={ domainName }
						showCancelButton
						submitActionText={ translate( 'Add Professional Email' ) }
					/>
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
