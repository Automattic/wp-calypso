import {
	GOOGLE_WORKSPACE_BUSINESS_STARTER_YEARLY,
	GOOGLE_WORKSPACE_BUSINESS_STARTER_MONTHLY,
} from '@automattic/calypso-products';
import { useShoppingCart } from '@automattic/shopping-cart';
import { translate } from 'i18n-calypso';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import googleWorkspaceIcon from 'calypso/assets/images/email-providers/google-workspace/icon.svg';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import GSuiteNewUserList from 'calypso/components/gsuite/gsuite-new-user-list';
import { hasDiscount } from 'calypso/components/gsuite/gsuite-price';
import InfoPopover from 'calypso/components/info-popover';
import { canCurrentUserAddEmail, getSelectedDomain } from 'calypso/lib/domains';
import { getGoogleMailServiceFamily } from 'calypso/lib/gsuite';
import { GOOGLE_PROVIDER_NAME } from 'calypso/lib/gsuite/constants';
import {
	areAllUsersValid,
	getItemsForCart,
	GSuiteNewUser,
	newUsers,
} from 'calypso/lib/gsuite/new-users';
import { formatPrice } from 'calypso/lib/gsuite/utils/format-price';
import useCartKey from 'calypso/my-sites/checkout/use-cart-key';
import { getGoogleAppLogos } from 'calypso/my-sites/email/email-provider-features/list';
import { IntervalLength } from 'calypso/my-sites/email/email-providers-comparison/interval-length';
import PriceBadge from 'calypso/my-sites/email/email-providers-comparison/price-badge';
import PriceWithInterval from 'calypso/my-sites/email/email-providers-comparison/price-with-interval';
import EmailProvidersStackedCard from 'calypso/my-sites/email/email-providers-stacked-comparison/email-provider-stacked-card';
import {
	EmailProvidersStackedCardProps,
	ProviderCard,
} from 'calypso/my-sites/email/email-providers-stacked-comparison/provider-cards/provider-card-props';
import {
	addToCartAndCheckout,
	recordTracksEventAddToCartClick,
} from 'calypso/my-sites/email/email-providers-stacked-comparison/provider-cards/utils';
import { FullWidthButton } from 'calypso/my-sites/marketplace/components';
import { getCurrentUserCurrencyCode } from 'calypso/state/currency-code/selectors';
import { getProductBySlug } from 'calypso/state/products-list/selectors';
import { getDomainsBySiteId } from 'calypso/state/sites/domains/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import type { MinimalRequestCartProduct } from '@automattic/shopping-cart';
import type { TranslateResult } from 'i18n-calypso';
import type { ReactElement } from 'react';

import './google-workspace-card.scss';

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};

function identityMap< T >( item: T ): T {
	return item;
}

const getGoogleFeatures = (): TranslateResult[] => {
	return [
		translate( 'Send and receive from your custom domain' ),
		translate( '30GB storage' ),
		translate( 'Email, calendars, and contacts' ),
		translate( 'Video calls, docs, spreadsheets, and more' ),
		translate( 'Work from anywhere on any device – even offline' ),
	];
};

const googleWorkspaceCardInformation: ProviderCard = {
	className: 'google-workspace-card',
	detailsExpanded: false,
	expandButtonLabel: translate( 'Select' ),
	onExpandedChange: noop,
	providerKey: 'google',
	showExpandButton: true,
	description: translate(
		'Professional email integrated with Google Meet and other productivity tools from Google.'
	),
	logo: { path: googleWorkspaceIcon, className: 'google-workspace-icon' },
	appLogos: getGoogleAppLogos(),
	productName: getGoogleMailServiceFamily(),
	features: getGoogleFeatures(),
};

const GoogleWorkspaceCard = ( {
	cartDomainName,
	comparisonContext,
	detailsExpanded,
	intervalLength,
	onExpandedChange,
	selectedDomainName,
	source,
}: EmailProvidersStackedCardProps ): ReactElement => {
	const googleWorkspace: ProviderCard = { ...googleWorkspaceCardInformation };
	googleWorkspace.detailsExpanded = detailsExpanded;

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

	const gSuiteProduct = useSelector( ( state ) =>
		getProductBySlug(
			state,
			intervalLength === IntervalLength.MONTHLY
				? GOOGLE_WORKSPACE_BUSINESS_STARTER_MONTHLY
				: GOOGLE_WORKSPACE_BUSINESS_STARTER_YEARLY
		)
	);

	const productIsDiscounted = hasDiscount( gSuiteProduct );

	const priceWithInterval = (
		<PriceWithInterval
			cost={ gSuiteProduct?.cost ?? 0 }
			currencyCode={ currencyCode ?? '' }
			hasDiscount={ productIsDiscounted }
			intervalLength={ intervalLength }
			sale={ gSuiteProduct?.sale_cost ?? null }
		/>
	);

	const standardPriceForIntervalLength = formatPrice(
		gSuiteProduct?.cost ?? 0,
		currencyCode ?? ''
	);
	const salePriceForIntervalLength = formatPrice(
		gSuiteProduct?.sale_cost ?? 0,
		currencyCode ?? ''
	);

	const discount = productIsDiscounted ? (
		<div className="google-workspace-card__discount-with-renewal">
			{ translate(
				'%(discount)d%% off{{span}}, %(discountedPrice)s billed today, renews at %(standardPrice)s{{/span}}',
				{
					args: {
						discount: gSuiteProduct?.sale_coupon?.discount,
						discountedPrice: salePriceForIntervalLength,
						standardPrice: standardPriceForIntervalLength,
					},
					comment:
						"%(discount)d is a numeric percentage discount (e.g. '50'), " +
						"%(discountedPrice)s is a formatted, discounted price that the user will pay today (e.g. '$3'), " +
						"%(standardPrice)s is a formatted price (e.g. '$5')",
					components: {
						span: <span />,
					},
				}
			) }

			<InfoPopover position="right" showOnHover>
				{ translate(
					'This discount is only available the first time you purchase a %(googleMailService)s account, any additional mailboxes purchased after that will be at the regular price.',
					{
						args: {
							googleMailService: googleWorkspace.productName,
						},
						comment: '%(googleMailService)s can be either "G Suite" or "Google Workspace"',
					}
				) }
			</InfoPopover>
		</div>
	) : null;

	googleWorkspace.priceBadge = (
		<PriceBadge
			additionalPriceInformationComponent={ discount }
			priceComponent={ priceWithInterval }
		/>
	);

	const [ googleUsers, setGoogleUsers ] = useState( newUsers( selectedDomainName ) );
	const [ addingToCart, setAddingToCart ] = useState( false );

	const onGoogleConfirmNewMailboxes = () => {
		const usersAreValid = areAllUsersValid( googleUsers );
		const userCanAddEmail = hasCartDomain || canCurrentUserAddEmail( domain );

		recordTracksEventAddToCartClick(
			comparisonContext,
			googleUsers?.map( ( user: GSuiteNewUser ) => user.uuid ),
			usersAreValid,
			GOOGLE_PROVIDER_NAME,
			source,
			userCanAddEmail,
			null
		);

		if ( ! usersAreValid || ! userCanAddEmail ) {
			return;
		}

		setAddingToCart( true );
		const domainsForCart = domain ? [ domain ] : [];

		const cartItems: MinimalRequestCartProduct[] = getItemsForCart(
			domainsForCart,
			gSuiteProduct?.product_slug ?? '',
			googleUsers
		);

		addToCartAndCheckout(
			shoppingCartManager,
			cartItems[ 0 ],
			setAddingToCart,
			selectedSite?.slug ?? ''
		);
	};

	const onGoogleFormReturnKeyPress = noop;

	const domainList = domain ? [ domain ] : [];

	googleWorkspace.onExpandedChange = onExpandedChange;
	googleWorkspace.formFields = (
		<FormFieldset className="google-workspace-card__form-fieldset">
			<GSuiteNewUserList
				extraValidation={ identityMap }
				domains={ domainList }
				onUsersChange={ setGoogleUsers }
				selectedDomainName={ selectedDomainName }
				users={ googleUsers }
				onReturnKeyPress={ onGoogleFormReturnKeyPress }
				showAddAnotherMailboxButton={ false }
			>
				<FullWidthButton
					className="google-workspace-card__continue"
					primary
					busy={ addingToCart }
					onClick={ onGoogleConfirmNewMailboxes }
				>
					{ translate( 'Create your mailbox' ) }
				</FullWidthButton>
			</GSuiteNewUserList>
		</FormFieldset>
	);

	return <EmailProvidersStackedCard { ...googleWorkspace } />;
};

export default GoogleWorkspaceCard;
