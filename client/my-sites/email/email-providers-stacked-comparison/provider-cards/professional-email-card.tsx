import { TITAN_MAIL_MONTHLY_SLUG, TITAN_MAIL_YEARLY_SLUG } from '@automattic/calypso-products';
import { Gridicon } from '@automattic/components';
import { useShoppingCart } from '@automattic/shopping-cart';
import { translate } from 'i18n-calypso';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import poweredByTitanLogo from 'calypso/assets/images/email-providers/titan/powered-by-titan-caps.svg';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import {
	titanMailMonthly,
	titanMailYearly,
	TitanProductProps,
} from 'calypso/lib/cart-values/cart-items';
import { getSelectedDomain, canCurrentUserAddEmail } from 'calypso/lib/domains';
import { areAllUsersValid, GSuiteNewUser, newUsers } from 'calypso/lib/gsuite/new-users';
import { getTitanProductName, isDomainEligibleForTitanFreeTrial } from 'calypso/lib/titan';
import { TITAN_PROVIDER_NAME } from 'calypso/lib/titan/constants';
import { transformProviderMailboxForCart } from 'calypso/lib/titan/new-mailbox';
import useCartKey from 'calypso/my-sites/checkout/use-cart-key';
import { IntervalLength } from 'calypso/my-sites/email/email-providers-comparison/interval-length';
import PriceBadge from 'calypso/my-sites/email/email-providers-comparison/price-badge';
import PriceWithInterval from 'calypso/my-sites/email/email-providers-comparison/price-with-interval';
import EmailProviderForm from 'calypso/my-sites/email/email-providers-stacked-comparison/email-provider-form';
import { EmailProviderFormField } from 'calypso/my-sites/email/email-providers-stacked-comparison/email-provider-form/email-provider-single-user';
import EmailProvidersStackedCard from 'calypso/my-sites/email/email-providers-stacked-comparison/email-provider-stacked-card';
import {
	addToCartAndCheckout,
	recordTracksEventAddToCartClick,
} from 'calypso/my-sites/email/email-providers-stacked-comparison/provider-cards/utils';
import { FullWidthButton } from 'calypso/my-sites/marketplace/components';
import { getCurrentUserCurrencyCode } from 'calypso/state/currency-code/selectors';
import { getProductBySlug } from 'calypso/state/products-list/selectors';
import { getDomainsBySiteId } from 'calypso/state/sites/domains/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import type { EmailProvidersStackedCardProps, ProviderCard } from './provider-card-props';
import type { ResponseDomain } from 'calypso/lib/domains/types';
import type { ReactElement } from 'react';

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
	className: 'professional-email-card',
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

const ProfessionalEmailCard = ( {
	cartDomainName,
	detailsExpanded,
	onExpandedChange,
	selectedDomainName,
	intervalLength,
	comparisonContext,
	source,
}: EmailProvidersStackedCardProps ): ReactElement => {
	const hasCartDomain = Boolean( cartDomainName );
	const currencyCode = useSelector( getCurrentUserCurrencyCode );
	const selectedSite = useSelector( getSelectedSite );
	const domains = useSelector( ( state ) => getDomainsBySiteId( state, selectedSite?.ID ) );
	const domain = getSelectedDomain( {
		domains,
		selectedDomainName: selectedDomainName,
	} );

	const cartKey = useCartKey();
	const shoppingCartManager = useShoppingCart( cartKey );

	const professionalEmail: ProviderCard = { ...professionalEmailCardInformation };
	professionalEmail.detailsExpanded = detailsExpanded;

	const isEligibleForFreeTrial = hasCartDomain || isDomainEligibleForTitanFreeTrial( domain );

	const titanMailSlug =
		intervalLength === IntervalLength.MONTHLY ? TITAN_MAIL_MONTHLY_SLUG : TITAN_MAIL_YEARLY_SLUG;

	const titanMailProduct = useSelector( ( state ) => getProductBySlug( state, titanMailSlug ) );

	const [ titanMailbox, setTitanMailbox ] = useState( newUsers( selectedDomainName ) );
	const [ addingToCart, setAddingToCart ] = useState( false );

	const onTitanConfirmNewMailboxes = () => {
		const usersAreValid = areAllUsersValid( titanMailbox, [
			EmailProviderFormField.FIRST_NAME,
			EmailProviderFormField.LAST_NAME,
		] );
		const userCanAddEmail = hasCartDomain || canCurrentUserAddEmail( domain );
		recordTracksEventAddToCartClick(
			comparisonContext,
			titanMailbox?.map( ( user: GSuiteNewUser ) => user.uuid ),
			usersAreValid,
			TITAN_PROVIDER_NAME,
			source,
			userCanAddEmail,
			null
		);

		if ( ! usersAreValid || ! userCanAddEmail ) {
			return;
		}

		setAddingToCart( true );

		const props: TitanProductProps = {
			domain: selectedDomainName,
			quantity: titanMailbox.length,
			extra: {
				email_users: titanMailbox.map( transformProviderMailboxForCart ),
				new_quantity: titanMailbox.length,
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
			{ isDomainEligibleForTitanFreeTrial( domain as ResponseDomain ) && (
				<div className="professional-email-card__discount badge badge--info-green">
					{ translate( '3 months free' ) }
				</div>
			) }
			<PriceBadge priceComponent={ priceWithInterval } />
		</>
	);

	function identityMap< T >( item: T ): T {
		return item;
	}
	const domainsForm = [ domain ];
	const form = (
		<FormFieldset className="professional-email-card__form-fieldset">
			<EmailProviderForm
				extraValidation={ identityMap }
				domains={ domainsForm }
				hiddenFields={ [ EmailProviderFormField.FIRST_NAME, EmailProviderFormField.LAST_NAME ] }
				onUsersChange={ setTitanMailbox }
				selectedDomainName={ selectedDomainName }
				users={ titanMailbox }
				onReturnKeyPress={ onTitanFormReturnKeyPress }
				showAddAnotherMailboxButton={ false }
			>
				<FullWidthButton
					className="professional-email-card__continue"
					primary
					busy={ addingToCart }
					onClick={ onTitanConfirmNewMailboxes }
				>
					{ translate( 'Create your mailbox' ) }
				</FullWidthButton>
			</EmailProviderForm>
		</FormFieldset>
	);

	professionalEmail.formFields = form;

	return <EmailProvidersStackedCard { ...professionalEmail } />;
};

export default ProfessionalEmailCard;
