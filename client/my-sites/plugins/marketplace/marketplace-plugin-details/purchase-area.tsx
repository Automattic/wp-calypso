/**
 * External dependencies
 */
import React, { useState } from 'react';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
import type { ResponseCart } from '@automattic/shopping-cart';

interface PurchaseArea {
	siteDomains: any[];
	isProductListLoading: boolean;
	displayCost?: string | null;
	wporgPluginName?: string;
	onAddYoastPremiumToCart: () => Promise< ResponseCart >;
	onNavigateToCheckout: () => void;
	onNavigateToDomainsSelection: () => void;
	onRemoveEverythingFromCart: () => Promise< ResponseCart >;
	onInstallPluginManually: ( primaryDomain: string ) => Promise< void >;
}

export default function PurchaseArea( {
	siteDomains,
	isProductListLoading,
	displayCost,
	wporgPluginName,
	onAddYoastPremiumToCart,
	onNavigateToCheckout,
	onNavigateToDomainsSelection,
	onRemoveEverythingFromCart,
	onInstallPluginManually,
}: PurchaseArea ): JSX.Element {
	const [ isButtonClicked, setIsButtonClicked ] = useState( false );

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
			evaluateIsCustomDomainAvailable( siteDomains ) &&
			siteDomains.find( isCustomDomain )?.isPrimary
		);
	}
	function getPrimaryDomain( siteDomains: any[] ): any {
		return siteDomains.find( ( { isPrimary } ) => isPrimary );
	}

	const onAddPlugin = async ( isProductPurchased: boolean ) => {
		setIsButtonClicked( true );
		const isCustomDomainAvailable = evaluateIsCustomDomainAvailable( siteDomains );
		const isCustomDomainPrimary = evaluateIsCustomDomainPrimary( siteDomains );

		await onRemoveEverythingFromCart();

		if ( isProductPurchased ) {
			await onAddYoastPremiumToCart();
		} else {
			const primaryDomain = getPrimaryDomain( siteDomains ).domain;
			onInstallPluginManually( primaryDomain );
		}

		if ( isCustomDomainAvailable && isCustomDomainPrimary && isProductPurchased ) {
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
			<div className="marketplace-plugin-details__name">{ wporgPluginName }</div>
			<div>
				<h2>Yoast Premium cost : { ! isProductListLoading ? displayCost : '' }</h2>
				<Button busy={ isButtonClicked } onClick={ () => onAddPlugin( true ) } primary>
					Buy Yoast Premium
				</Button>
			</div>
			<div>
				<h2>Yoast Free cost : Free</h2>
				<Button busy={ isButtonClicked } onClick={ () => onAddPlugin( false ) } primary>
					Add Yoast Free
				</Button>
			</div>
		</>
	);
}
