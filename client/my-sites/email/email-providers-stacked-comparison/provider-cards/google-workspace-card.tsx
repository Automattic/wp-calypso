import {
	GOOGLE_WORKSPACE_BUSINESS_STARTER_MONTHLY,
	GOOGLE_WORKSPACE_BUSINESS_STARTER_YEARLY,
} from '@automattic/calypso-products';
import { useShoppingCart } from '@automattic/shopping-cart';
import { translate } from 'i18n-calypso';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import googleWorkspaceIcon from 'calypso/assets/images/email-providers/google-workspace/icon.svg';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import GSuiteNewUserList from 'calypso/components/gsuite/gsuite-new-user-list';
import { canCurrentUserAddEmail, getSelectedDomain } from 'calypso/lib/domains';
import { hasGSuiteSupportedDomain, getGoogleMailServiceFamily } from 'calypso/lib/gsuite';
import { GOOGLE_PROVIDER_NAME } from 'calypso/lib/gsuite/constants';
import {
	areAllUsersValid,
	getItemsForCart,
	GSuiteNewUser,
	newUsers,
} from 'calypso/lib/gsuite/new-users';
import useCartKey from 'calypso/my-sites/checkout/use-cart-key';
import { getGoogleAppLogos } from 'calypso/my-sites/email/email-provider-features/list';
import { IntervalLength } from 'calypso/my-sites/email/email-providers-comparison/interval-length';
import GoogleWorkspacePrice from 'calypso/my-sites/email/email-providers-comparison/price/google-workspace';
import EmailProvidersStackedCard from 'calypso/my-sites/email/email-providers-stacked-comparison/email-provider-stacked-card';
import {
	EmailProvidersStackedCardProps,
	ProviderCardProps,
} from 'calypso/my-sites/email/email-providers-stacked-comparison/provider-cards/provider-card-props';
import {
	addToCartAndCheckout,
	recordTracksEventAddToCartClick,
} from 'calypso/my-sites/email/email-providers-stacked-comparison/provider-cards/utils';
import { FullWidthButton } from 'calypso/my-sites/marketplace/components';
import { getProductBySlug } from 'calypso/state/products-list/selectors';
import canUserPurchaseGSuite from 'calypso/state/selectors/can-user-purchase-gsuite';
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
		translate( 'Real-time collaboration' ),
		translate( 'Store and share files in the cloud' ),
		translate( '24/7 support via email' ),
	];
};

const googleWorkspaceCardInformation: ProviderCardProps = {
	className: 'google-workspace-card',
	expandButtonLabel: translate( 'Select' ),
	providerKey: 'google',
	description: translate(
		'Business email with Gmail. Includes other collaboration and productivity tools from Google.'
	),
	logo: { path: googleWorkspaceIcon, className: 'google-workspace-icon' },
	appLogos: getGoogleAppLogos(),
	productName: getGoogleMailServiceFamily(),
	features: getGoogleFeatures(),
};

const GoogleWorkspaceCard = ( {
	comparisonContext,
	detailsExpanded,
	intervalLength,
	isDomainInCart = false,
	onExpandedChange,
	selectedDomainName,
	source,
}: EmailProvidersStackedCardProps ): ReactElement => {
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

	const canPurchaseGSuite = useSelector( canUserPurchaseGSuite );

	const [ googleUsers, setGoogleUsers ] = useState( newUsers( selectedDomainName ) );
	const [ addingToCart, setAddingToCart ] = useState( false );

	const isGSuiteSupported =
		canPurchaseGSuite && ( isDomainInCart || hasGSuiteSupportedDomain( [ domain ] ) );

	const googleWorkspace: ProviderCardProps = { ...googleWorkspaceCardInformation };
	googleWorkspace.detailsExpanded = isGSuiteSupported && detailsExpanded;
	googleWorkspace.showExpandButton = isGSuiteSupported;
	googleWorkspace.priceBadge = (
		<GoogleWorkspacePrice
			domain={ domain }
			isDomainInCart={ isDomainInCart }
			intervalLength={ intervalLength }
		/>
	);

	const onGoogleConfirmNewMailboxes = () => {
		const usersAreValid = areAllUsersValid( googleUsers );
		const userCanAddEmail = isDomainInCart || canCurrentUserAddEmail( domain );

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
