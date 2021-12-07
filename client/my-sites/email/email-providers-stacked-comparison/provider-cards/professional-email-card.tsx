import { TITAN_MAIL_ANNUALLY_SLUG, TITAN_MAIL_MONTHLY_SLUG } from '@automattic/calypso-products';
import { Gridicon } from '@automattic/components';
import { RequestCartProductExtra, withShoppingCart } from '@automattic/shopping-cart';
import { translate } from 'i18n-calypso';
import React, { FunctionComponent, useState } from 'react';
import { connect } from 'react-redux';
import poweredByTitanLogo from 'calypso/assets/images/email-providers/titan/powered-by-titan-caps.svg';
import { titanMailAnnually, titanMailMonthly } from 'calypso/lib/cart-values/cart-items';
import {
	getSelectedDomain,
	canCurrentUserAddEmail,
	getCurrentUserCannotAddEmailReason,
} from 'calypso/lib/domains';
import { getTitanProductName, isDomainEligibleForTitanFreeTrial } from 'calypso/lib/titan';
import { TITAN_PROVIDER_NAME } from 'calypso/lib/titan/constants';
import withCartKey from 'calypso/my-sites/checkout/with-cart-key';
import EmailProvidersStackedCard from 'calypso/my-sites/email/email-providers-stacked-comparison/email-provider-stacked-card';
import { FullWidthButton } from 'calypso/my-sites/marketplace/components';
import { getCurrentUserCurrencyCode } from 'calypso/state/currency-code/selectors';
import { getProductBySlug, getProductsList } from 'calypso/state/products-list/selectors';
import { getDomainsBySiteId } from 'calypso/state/sites/domains/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import {
	EmailProviderGenericForm,
	GENERIC_EMAIL_FORM_ALTERNATIVE_EMAIL_FIELD,
	GENERIC_EMAIL_FORM_EMAIL_FIELD,
	GENERIC_EMAIL_FORM_FIRST_NAME_FIELD,
	GENERIC_EMAIL_FORM_FULL_NAME_FIELD,
	GENERIC_EMAIL_FORM_IS_ADMIN_FIELD,
	GENERIC_EMAIL_FORM_LAST_NAME_FIELD,
	GenericNewUser,
	newUser,
	transformGenericUserFromTitanMailboxForCart,
} from '../email-provider-stacked-card/email-provider-generic-form';
import {
	addToCartAndCheckout,
	PriceBadge,
	PriceWithInterval,
	recordTracksEventAddToCartClick,
	IntervalLength,
} from './utils';
import type { EmailProvidersStackedCardProps, ProviderCard } from './provider-card-props';

import './professional-email-card.scss';

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};
const logo = <Gridicon className="professional-email-card__logo" icon="my-sites" />;
const badge = <img src={ poweredByTitanLogo } alt={ translate( 'Powered by Titan' ).toString() } />;
const getTitanFeatures = () => {
	return [
		translate( 'Inbox, calendars, and contacts' ),
		translate( '30GB storage' ),
		translate( '24/7 support via email' ),
	];
};

const identityMap = ( item: any ) => item;

const professionalEmailCardInformation: ProviderCard = {
	detailsExpanded: true,
	expandButtonLabel: translate( 'Select' ),
	onExpandedChange: noop,
	providerKey: 'titan',
	showExpandButton: true,
	description: translate( 'Integrated email solution for your WordPress.com site.' ),
	logo,
	productName: getTitanProductName(),
	badge,
	features: getTitanFeatures(),
};

const ProfessionalEmailCard: FunctionComponent< EmailProvidersStackedCardProps > = ( props ) => {
	const {
		currencyCode = '',
		hasCartDomain,
		detailsExpanded,
		domain,
		onExpandedChange,
		selectedDomainName,
		intervalLength,
		titanMailMonthlyProduct,
		titanMailAnnuallyProduct,
	} = props;
	const professionalEmail: ProviderCard = { ...professionalEmailCardInformation };
	professionalEmail.detailsExpanded = detailsExpanded;

	const isEligibleForFreeTrial = hasCartDomain || isDomainEligibleForTitanFreeTrial( domain );

	const titanMailProduct =
		intervalLength === IntervalLength.MONTHLY ? titanMailMonthlyProduct : titanMailAnnuallyProduct;

	const [ genericUsers, setGenericUsers ] = useState( [ newUser( selectedDomainName ) ] );
	const [ addingToCart, setAddingToCart ] = useState( false );
	const [ validForm, setValidForm ] = useState( false );

	const onConfirmNewMailboxes = () => {
		const {
			comparisonContext,
			domain,
			hasCartDomain,
			productsList,
			shoppingCartManager,
			selectedDomainName,
			selectedSite,
			source,
		} = props;

		const userCanAddEmail = hasCartDomain || canCurrentUserAddEmail( domain );
		const userCannotAddEmailReason = userCanAddEmail
			? null
			: getCurrentUserCannotAddEmailReason( domain );

		recordTracksEventAddToCartClick(
			comparisonContext,
			genericUsers?.map( ( user: GenericNewUser ) => user.uuid ),
			validForm,
			TITAN_PROVIDER_NAME,
			source,
			userCanAddEmail,
			userCannotAddEmailReason
		);

		const cartProps: {
			meta?: string;
			domain?: string;
			source?: string;
			quantity?: number | null;
			extra?: RequestCartProductExtra & { email_users: any };
		} = {
			domain: selectedDomainName,
			quantity: genericUsers.length,
			extra: {
				email_users: genericUsers.map( transformGenericUserFromTitanMailboxForCart ),
				new_quantity: genericUsers.length,
			},
		};

		const cartItem =
			intervalLength === IntervalLength.MONTHLY
				? titanMailMonthly( cartProps )
				: titanMailAnnually( cartProps );

		addToCartAndCheckout(
			shoppingCartManager,
			cartItem,
			productsList,
			setAddingToCart,
			selectedSite?.slug ?? ''
		);
	};

	const onTitanFormReturnKeyPress = noop;

	const priceWithInterval = (
		<PriceWithInterval
			className={ 'professional-email-card' }
			intervalLength={ intervalLength }
			cost={ titanMailProduct?.cost ?? 0 }
			currencyCode={ currencyCode ?? '' }
			hasDiscount={ isEligibleForFreeTrial }
		/>
	);

	professionalEmail.footerBadge = badge;
	professionalEmail.onExpandedChange = onExpandedChange;
	professionalEmail.priceBadge = (
		<>
			{ isDomainEligibleForTitanFreeTrial( domain ) && (
				<div className="professional-email-card__discount badge badge--info-green">
					{ translate( '3 months free' ) }
				</div>
			) }
			<PriceBadge priceComponent={ priceWithInterval } className={ 'professional-email-card' } />
		</>
	);

	const domainList = domain ? [ domain ] : [];

	professionalEmail.formFields = (
		<EmailProviderGenericForm
			extraValidation={ identityMap }
			domains={ domainList }
			onUsersChange={ setGenericUsers }
			selectedDomainName={ selectedDomainName }
			users={ genericUsers }
			onReturnKeyPress={ onTitanFormReturnKeyPress }
			showAddAnotherMailboxButton={ false }
			setValidForm={ setValidForm }
			hiddenFields={ [
				GENERIC_EMAIL_FORM_EMAIL_FIELD,
				GENERIC_EMAIL_FORM_FULL_NAME_FIELD,
				GENERIC_EMAIL_FORM_FIRST_NAME_FIELD,
				GENERIC_EMAIL_FORM_LAST_NAME_FIELD,
				GENERIC_EMAIL_FORM_IS_ADMIN_FIELD,
				GENERIC_EMAIL_FORM_ALTERNATIVE_EMAIL_FIELD,
			] }
		>
			<FullWidthButton
				className="professional-email-card__continue"
				primary
				busy={ addingToCart }
				onClick={ onConfirmNewMailboxes }
			>
				{ translate( 'Create your mailbox' ) }
			</FullWidthButton>
		</EmailProviderGenericForm>
	);

	return <EmailProvidersStackedCard { ...professionalEmail } />;
};

export default connect( ( state, ownProps: EmailProvidersStackedCardProps ) => {
	const selectedSite = getSelectedSite( state );
	const domains = getDomainsBySiteId( state, selectedSite?.ID );
	const domain = getSelectedDomain( {
		domains,
		selectedDomainName: ownProps.selectedDomainName,
	} );
	const resolvedDomainName = domain ? domain.name : ownProps.selectedDomainName;

	const hasCartDomain = Boolean( ownProps.cartDomainName );

	return {
		currencyCode: getCurrentUserCurrencyCode( state ),
		domain,
		selectedDomainName: resolvedDomainName,
		hasCartDomain,
		productsList: getProductsList( state ),
		selectedSite,
		titanMailMonthlyProduct: getProductBySlug( state, TITAN_MAIL_MONTHLY_SLUG ),
		titanMailAnnuallyProduct: getProductBySlug( state, TITAN_MAIL_ANNUALLY_SLUG ),
	};
} )( withCartKey( withShoppingCart( ProfessionalEmailCard ) ) );
