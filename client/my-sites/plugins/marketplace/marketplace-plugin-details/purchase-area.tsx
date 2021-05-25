/**
 * External dependencies
 */
import React, { useState } from 'react';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';

interface PurchseArea {
	siteDomains: any[];
	isProductListLoading: boolean;
	displayCost?: string | null;
	wporgPluginName?: string;
	onAddYoastPremiumToCart: () => void;
	onNavigateToCheckout: () => void;
	onNavigateToDomainsSelection: () => void;
}

export default function PurchaseArea( {
	siteDomains,
	isProductListLoading,
	displayCost,
	wporgPluginName,
	onAddYoastPremiumToCart,
	onNavigateToCheckout,
	onNavigateToDomainsSelection,
}: PurchseArea ): JSX.Element {
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

	const onAddPlugin = async ( isProductPurchased: boolean ) => {
		setIsButtonClicked( true );
		const isCustomDomainAvailable = evaluateIsCustomDomainAvailable( siteDomains );
		const isCustomDomainPrimary = evaluateIsCustomDomainPrimary( siteDomains );
		if ( isProductPurchased ) {
			await onAddYoastPremiumToCart();
		}

		if ( isCustomDomainAvailable && isCustomDomainPrimary ) {
			if ( isProductPurchased ) {
				onNavigateToCheckout();
			} else {
				//To be replaced with loading screen and then thank-you page
				alert( 'To be implemented : Loading Screen -> Thank You Page' );
			}
		} else if ( isCustomDomainAvailable && ! isCustomDomainPrimary ) {
			//Pop up Modal for deciding on primary domain and related logic
			setIsButtonClicked( false );
			alert( 'To be implemented : Domain deciding Pop up modal ' );
		} else if ( ! isCustomDomainAvailable ) {
			onNavigateToDomainsSelection();
		} else {
			alert( 'Unknown combination' );
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
