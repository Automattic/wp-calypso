import {
	GOOGLE_WORKSPACE_BUSINESS_STARTER_YEARLY,
	GOOGLE_WORKSPACE_BUSINESS_STARTER_MONTHLY,
} from '@automattic/calypso-products';
import { withShoppingCart } from '@automattic/shopping-cart';
import { translate } from 'i18n-calypso';
import React, { FunctionComponent, useState } from 'react';
import { connect } from 'react-redux';
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
import withCartKey from 'calypso/my-sites/checkout/with-cart-key';
import EmailProvidersStackedCard from 'calypso/my-sites/email/email-providers-stacked-comparison/email-provider-stacked-card';
import {
	EmailProvidersStackedCardProps,
	ProviderCard,
} from 'calypso/my-sites/email/email-providers-stacked-comparison/provider-cards/provider-card-props';
import { FullWidthButton } from 'calypso/my-sites/marketplace/components';
import { getCurrentUserCurrencyCode } from 'calypso/state/currency-code/selectors';
import { getProductBySlug, getProductsList } from 'calypso/state/products-list/selectors';
import { getDomainsBySiteId } from 'calypso/state/sites/domains/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import {
	AddToCartAndCheckout,
	PriceBadge,
	PriceWithTerm,
	recordTracksEventAddToCartClick,
	TermLength,
} from './utils';

import './google-workspace-card.scss';

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};
const identityMap = ( item: any ) => item;

const getGoogleFeatures = () => {
	return [
		translate( 'Send and receive from your custom domain' ),
		translate( '30GB storage' ),
		translate( 'Email, calendars, and contacts' ),
		translate( 'Video calls, docs, spreadsheets, and more' ),
		translate( 'Work from anywhere on any device – even offline' ),
	];
};

const googleWorkspaceCardInformation: ProviderCard = {
	detailsExpanded: false,
	expandButtonLabel: translate( 'Select' ),
	onExpandedChange: noop,
	providerKey: 'google',
	showExpandButton: true,
	description: translate( 'Productivity tools and mailbox from Google.' ),
	logo: { path: googleWorkspaceIcon, className: 'google-workspace-icon' },
	productName: getGoogleMailServiceFamily(),
	features: getGoogleFeatures(),
};

const GoogleWorkspaceCard: FunctionComponent< EmailProvidersStackedCardProps > = ( props ) => {
	const {
		currencyCode = '',
		detailsExpanded,
		domain,
		gSuiteProductMonthly,
		gSuiteProductYearly,
		onExpandedChange,
		selectedDomainName,
		termLength,
	} = props;
	const googleWorkspace: ProviderCard = googleWorkspaceCardInformation;
	googleWorkspace.detailsExpanded = detailsExpanded;

	const gSuiteProduct =
		termLength === TermLength.MONTHLY ? gSuiteProductMonthly : gSuiteProductYearly;

	const productIsDiscounted = hasDiscount( gSuiteProduct );

	const priceWithTerm = (
		<PriceWithTerm
			className={ 'google-workspace-card' }
			termLength={ termLength }
			cost={ gSuiteProduct?.cost ?? 0 }
			currencyCode={ currencyCode ?? '' }
			hasDiscount={ productIsDiscounted }
		/>
	);

	const standardPriceForTermLength = formatPrice( gSuiteProduct?.cost, currencyCode ?? '' );
	const salePriceForTermLength = formatPrice( gSuiteProduct?.sale_cost, currencyCode ?? '' );

	const discount = productIsDiscounted ? (
		<div className="google-workspace-card__discount-with-renewal">
			{ translate(
				'%(discount)d% off{{span}}, %(discountedPrice)s billed today, renews at %(standardPrice)s{{/span}}',
				{
					args: {
						discount: gSuiteProduct.sale_coupon.discount,
						discountedPrice: salePriceForTermLength,
						standardPrice: standardPriceForTermLength,
					},
					comment:
						'%(discount)d is a numeric discount percentage, e.g. 40; ' +
						'%(discountedPrice)s is a formatted, discounted price that the user will pay today, e.g. $3; ' +
						'%(standardPrice)s is a formatted price, e.g. $5',
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
			priceComponent={ priceWithTerm }
			className={ 'google-workspace-card' }
		/>
	);

	const [ googleUsers, setGoogleUsers ] = useState( newUsers( selectedDomainName ) );
	const [ addingToCart, setAddingToCart ] = useState( false );

	const onGoogleConfirmNewMailboxes = () => {
		const {
			comparisonContext,
			domain,
			gSuiteProductMonthly,
			gSuiteProductYearly,
			hasCartDomain,
			productsList,
			selectedSite,
			shoppingCartManager,
			source,
		} = props;

		const gSuiteProduct =
			termLength === TermLength.MONTHLY ? gSuiteProductMonthly : gSuiteProductYearly;

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

		const domains: { name: string }[] = domain ? [ domain ] : [];

		setAddingToCart( true );
		const cartItems: any = getItemsForCart( domains, gSuiteProduct.product_slug, googleUsers );

		AddToCartAndCheckout(
			shoppingCartManager,
			cartItems[ 0 ],
			productsList,
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
		domainName: resolvedDomainName,
		hasCartDomain,
		productsList: getProductsList( state ),
		selectedSite,
		gSuiteProductYearly: getProductBySlug( state, GOOGLE_WORKSPACE_BUSINESS_STARTER_YEARLY ),
		gSuiteProductMonthly: getProductBySlug( state, GOOGLE_WORKSPACE_BUSINESS_STARTER_MONTHLY ),
	};
} )( withCartKey( withShoppingCart( GoogleWorkspaceCard ) ) );
