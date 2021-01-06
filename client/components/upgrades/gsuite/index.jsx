/**
 * External dependencies
 */
import page from 'page';
import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useTranslate } from 'i18n-calypso';
import { useShoppingCart } from '@automattic/shopping-cart';

/**
 * Internal dependencies
 */
import config from 'calypso/config';
import { hasDomainInCart } from 'calypso/lib/cart-values/cart-items';
import {
	GOOGLE_WORKSPACE_BUSINESS_STARTER_YEARLY,
	GSUITE_BASIC_SLUG,
} from 'calypso/lib/gsuite/constants';
import GSuiteUpsellCard from './gsuite-upsell-card';
import HeaderCake from 'calypso/components/header-cake';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { fillInSingleCartItemAttributes } from 'calypso/lib/cart-values';
import { getProductsList } from 'calypso/state/products-list/selectors/get-products-list';

export default function GSuiteUpgrade( { domain } ) {
	const { responseCart: cart, addProductsToCart, isLoading } = useShoppingCart();
	const selectedSiteSlug = useSelector( getSelectedSiteSlug );
	const productsList = useSelector( getProductsList );

	const isMounted = useRef( true );
	useEffect( () => {
		return () => {
			isMounted.current = false;
		};
	}, [] );

	const handleAddEmailClick = ( cartItems ) => {
		addProductsToCart(
			cartItems.map( ( item ) => fillInSingleCartItemAttributes( item, productsList ) )
		).then( () => {
			isMounted.current && page( `/checkout/${ selectedSiteSlug }` );
		} );
	};

	const handleGoBack = () => {
		page( `/domains/add/${ selectedSiteSlug }` );
	};

	const handleSkipClick = () => {
		page( `/checkout/${ selectedSiteSlug }` );
	};

	useEffect( () => {
		if ( cart && ! isLoading && ! hasDomainInCart( cart, domain ) ) {
			// Should we handle this more gracefully?
			page( `/domains/add/${ selectedSiteSlug }` );
		}
	}, [ cart, domain, selectedSiteSlug, isLoading ] );

	const translate = useTranslate();

	const productSlug = config.isEnabled( 'google-workspace-migration' )
		? GOOGLE_WORKSPACE_BUSINESS_STARTER_YEARLY
		: GSUITE_BASIC_SLUG;

	return (
		<div>
			<HeaderCake onClick={ handleGoBack }>
				{ translate( 'Register %(domain)s', { args: { domain } } ) }
			</HeaderCake>

			<GSuiteUpsellCard
				domain={ domain }
				productSlug={ productSlug }
				onSkipClick={ handleSkipClick }
				onAddEmailClick={ handleAddEmailClick }
			/>
		</div>
	);
}
