import { TITAN_MAIL_MONTHLY_SLUG, TITAN_MAIL_YEARLY_SLUG } from '@automattic/calypso-products';
import { Gridicon } from '@automattic/components';
import { useShoppingCart } from '@automattic/shopping-cart';
import { translate } from 'i18n-calypso';
import { FunctionComponent, useState } from 'react';
import { useSelector } from 'react-redux';
import poweredByTitanLogo from 'calypso/assets/images/email-providers/titan/powered-by-titan-caps.svg';
import {
	titanMailMonthly,
	titanMailYearly,
	TitanProductProps,
} from 'calypso/lib/cart-values/cart-items';
import {
	getSelectedDomain,
	canCurrentUserAddEmail,
	getCurrentUserCannotAddEmailReason,
} from 'calypso/lib/domains';
import { getTitanProductName, isDomainEligibleForTitanFreeTrial } from 'calypso/lib/titan';
import { TITAN_PROVIDER_NAME } from 'calypso/lib/titan/constants';
import {
	areAllMailboxesValid,
	buildNewTitanMailbox,
	transformMailboxForCart,
	validateMailboxes as validateTitanMailboxes,
} from 'calypso/lib/titan/new-mailbox';
import useCartKey from 'calypso/my-sites/checkout/use-cart-key';
import EmailProvidersStackedCard from 'calypso/my-sites/email/email-providers-stacked-comparison/email-provider-stacked-card';
import PriceBadge from 'calypso/my-sites/email/email-providers-stacked-comparison/provider-cards/price-badge';
import PriceWithInterval from 'calypso/my-sites/email/email-providers-stacked-comparison/provider-cards/price-with-interval';
import {
	TITAN_PASSWORD_RESET_FIELD,
	TITAN_FULL_NAME_FIELD,
} from 'calypso/my-sites/email/titan-new-mailbox';
import TitanNewMailboxList from 'calypso/my-sites/email/titan-new-mailbox-list';
import { FullWidthButton } from 'calypso/my-sites/marketplace/components';
import { getCurrentUserCurrencyCode } from 'calypso/state/currency-code/selectors';
import { getProductBySlug } from 'calypso/state/products-list/selectors';
import { getDomainsBySiteId } from 'calypso/state/sites/domains/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import { addToCartAndCheckout, IntervalLength, recordTracksEventAddToCartClick } from './utils';
import type { EmailProvidersStackedCardProps, ProviderCard } from './provider-card-props';

import './professional-email-card.scss';

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};

const logo = <Gridicon className="professional-email-card__logo" icon="my-sites" />;
const badge = (
	<img src={ poweredByTitanLogo } alt={ translate( 'Powered by Titan', { textOnly: true } ) } />
);
const getTitanFeatures = () => {
	return [
		translate( 'Inbox, calendars, and contacts' ),
		translate( '30GB storage' ),
		translate( '24/7 support via email' ),
	];
};

const professionalEmailCardInformation: ProviderCard = {
	detailsExpanded: true,
	expandButtonLabel: translate( 'Select' ),
	onExpandedChange: noop,
	providerKey: 'titan',
	showExpandButton: true,
	description: translate( 'Integrated email solution for your WordPress.com site.' ),
	logo,
	productName: getTitanProductName(),
	footerBadge: badge,
	features: getTitanFeatures(),
};

const ProfessionalEmailCard: FunctionComponent< EmailProvidersStackedCardProps > = ( props ) => {
	const {
		detailsExpanded,
		onExpandedChange,
		selectedDomainName,
		intervalLength,
		comparisonContext,
		source,
	} = props;

	const hasCartDomain = Boolean( props.cartDomainName );
	const currencyCode = useSelector( getCurrentUserCurrencyCode );
	const selectedSite = useSelector( getSelectedSite );
	const domains = useSelector( ( state ) => getDomainsBySiteId( state, selectedSite?.ID ) );
	const domain = getSelectedDomain( {
		domains,
		selectedDomainName: selectedDomainName,
	} ) as unknown;

	const cartKey = useCartKey();
	const shoppingCartManager = useShoppingCart( cartKey );

	const professionalEmail: ProviderCard = { ...professionalEmailCardInformation };
	professionalEmail.detailsExpanded = detailsExpanded;

	const titanMailMonthlyProduct = useSelector( ( state ) =>
		getProductBySlug( state, TITAN_MAIL_MONTHLY_SLUG )
	);
	const titanMailYearlyProduct = useSelector( ( state ) =>
		getProductBySlug( state, TITAN_MAIL_YEARLY_SLUG )
	);

	const isEligibleForFreeTrial =
		hasCartDomain || isDomainEligibleForTitanFreeTrial( domain as Record< string, unknown > );

	const titanMailProduct =
		intervalLength === IntervalLength.MONTHLY ? titanMailMonthlyProduct : titanMailYearlyProduct;

	const [ titanMailbox, setTitanMailbox ] = useState( [
		buildNewTitanMailbox( selectedDomainName, false ),
	] );
	const [ addingToCart, setAddingToCart ] = useState( false );
	const [ validatedTitanMailboxUuids, setValidatedTitanMailboxUuids ] = useState( [ '' ] );
	const optionalFields = [ TITAN_PASSWORD_RESET_FIELD, TITAN_FULL_NAME_FIELD ];

	const onTitanConfirmNewMailboxes = () => {
		const validatedTitanMailboxes = validateTitanMailboxes( titanMailbox, optionalFields );

		const mailboxesAreValid = areAllMailboxesValid( validatedTitanMailboxes, optionalFields );
		const userCanAddEmail =
			hasCartDomain || canCurrentUserAddEmail( domain as Record< string, unknown > );
		const userCannotAddEmailReason = userCanAddEmail
			? null
			: getCurrentUserCannotAddEmailReason( domain );

		const validatedMailboxUuids = validatedTitanMailboxes.map( ( mailbox ) => mailbox.uuid );
		recordTracksEventAddToCartClick(
			comparisonContext,
			validatedMailboxUuids,
			mailboxesAreValid,
			TITAN_PROVIDER_NAME,
			source ?? '',
			userCanAddEmail,
			userCannotAddEmailReason
		);

		setTitanMailbox( titanMailbox );
		setValidatedTitanMailboxUuids( validatedMailboxUuids );

		if ( ! mailboxesAreValid || ! userCanAddEmail ) {
			return;
		}

		const props: TitanProductProps = {
			domain: selectedDomainName,
			quantity: validatedTitanMailboxes.length,
			extra: {
				email_users: validatedTitanMailboxes.map( transformMailboxForCart ),
				new_quantity: validatedTitanMailboxes.length,
			},
		};

		const cartItem =
			intervalLength === IntervalLength.MONTHLY
				? titanMailMonthly( props )
				: titanMailYearly( props );

		addToCartAndCheckout(
			shoppingCartManager,
			cartItem,
			setAddingToCart,
			selectedSite?.slug ?? ''
		);
	};

	const onTitanFormReturnKeyPress = noop;

	const priceWithInterval = (
		<PriceWithInterval
			intervalLength={ intervalLength }
			cost={ titanMailProduct?.cost ?? 0 }
			currencyCode={ currencyCode ?? '' }
			hasDiscount={ isEligibleForFreeTrial }
		/>
	);

	professionalEmail.onExpandedChange = onExpandedChange;
	professionalEmail.priceBadge = (
		<>
			{ isDomainEligibleForTitanFreeTrial( domain as Record< string, unknown > ) && (
				<div className="professional-email-card__discount badge badge--info-green">
					{ translate( '3 months free' ) }
				</div>
			) }
			<PriceBadge priceComponent={ priceWithInterval } className={ 'professional-email-card' } />
		</>
	);

	professionalEmail.formFields = (
		<TitanNewMailboxList
			onMailboxesChange={ setTitanMailbox }
			mailboxes={ titanMailbox }
			selectedDomainName={ selectedDomainName }
			onReturnKeyPress={ onTitanFormReturnKeyPress }
			showLabels={ true }
			validatedMailboxUuids={ validatedTitanMailboxUuids }
			showAddAnotherMailboxButton={ false }
			hiddenFieldNames={ [ TITAN_FULL_NAME_FIELD, TITAN_PASSWORD_RESET_FIELD ] }
		>
			<FullWidthButton
				className="professional-email-card__continue"
				primary
				busy={ addingToCart }
				onClick={ onTitanConfirmNewMailboxes }
			>
				{ translate( 'Create your mailbox' ) }
			</FullWidthButton>
		</TitanNewMailboxList>
	);

	return <EmailProvidersStackedCard { ...professionalEmail } />;
};

export default ProfessionalEmailCard;
