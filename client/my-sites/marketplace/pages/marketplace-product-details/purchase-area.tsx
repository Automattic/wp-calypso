import { Button } from '@automattic/components';
import { useState } from 'react';
import { findProductDefinition } from 'calypso/my-sites/marketplace/marketplace-product-definitions';
import { IProductCollection } from 'calypso/my-sites/marketplace/types';
import type { ResponseCart } from '@automattic/shopping-cart';

interface PurchaseArea {
	productSlug: keyof IProductCollection;
	siteDomains: any[];
	displayCost?: string | null;
	onAddMarketplaceProductToCart: (
		productSlug: string,
		primaryDomain: string
	) => Promise< ResponseCart >;
	onNavigateToCheckout: () => void;
	onNavigateToDomainsSelection: () => void;
	onRemoveEverythingFromCart: () => Promise< ResponseCart >;
	onInstallProductManually: (
		productSlug: keyof IProductCollection,
		primaryDomain: string
	) => void;
	isDisabled: boolean;
}

const isCustomDomain = ( {
	isWPCOMDomain,
	isWpcomStagingDomain,
}: {
	isWPCOMDomain: boolean;
	isWpcomStagingDomain: boolean;
} ) => ! isWPCOMDomain && ! isWpcomStagingDomain;

function evaluateIsCustomDomainAvailable( siteDomains: any[] ): boolean {
	return siteDomains.some( isCustomDomain );
}
function evaluateIsCustomDomainPrimary( siteDomains: any[] ): boolean {
	return (
		evaluateIsCustomDomainAvailable( siteDomains ) && siteDomains.find( isCustomDomain )?.isPrimary
	);
}
function getPrimaryDomain( siteDomains: any[] ): any {
	return siteDomains.find( ( { isPrimary } ) => isPrimary );
}

export default function PurchaseArea( {
	productSlug,
	siteDomains,
	displayCost,
	onAddMarketplaceProductToCart,
	onNavigateToCheckout,
	onNavigateToDomainsSelection,
	onRemoveEverythingFromCart,
	onInstallProductManually,
	isDisabled,
}: PurchaseArea ): JSX.Element {
	const [ isButtonClicked, setIsButtonClicked ] = useState( false );
	const product = findProductDefinition( productSlug );

	const onProductAdd = async () => {
		setIsButtonClicked( true );
		const isCustomDomainAvailable = evaluateIsCustomDomainAvailable( siteDomains );
		const isCustomDomainPrimary = evaluateIsCustomDomainPrimary( siteDomains );

		await onRemoveEverythingFromCart();
		const primaryDomain = getPrimaryDomain( siteDomains ).domain;
		const { isPurchasableProduct } = product || {};
		if ( isPurchasableProduct === true ) {
			await onAddMarketplaceProductToCart( productSlug, primaryDomain );
		} else {
			onInstallProductManually( productSlug, primaryDomain );
		}

		if ( isCustomDomainAvailable && isCustomDomainPrimary && isPurchasableProduct ) {
			onNavigateToCheckout();
		} else if ( isCustomDomainAvailable && ! isCustomDomainPrimary ) {
			// TODO: Pop up Modal for deciding on primary domain and related logic
			setIsButtonClicked( false );
		} else if ( ! isCustomDomainAvailable ) {
			onNavigateToDomainsSelection();
		}
	};

	return (
		<>
			<div className="marketplace-product-details__name">{ product?.productName }</div>
			<div>
				<h2>Cost : { displayCost }</h2>
				<Button busy={ isButtonClicked } onClick={ () => onProductAdd() } disabled={ isDisabled }>
					Add { product?.productName }
				</Button>
			</div>
		</>
	);
}
