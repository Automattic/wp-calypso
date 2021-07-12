/**
 * External dependencies
 */
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { styled } from '@automattic/wpcom-checkout';
import { useTranslate } from 'i18n-calypso';
import { useSelector, useDispatch } from 'react-redux';
import formatCurrency, { CURRENCIES } from '@automattic/format-currency';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import { requestPlans } from 'calypso/state/plans/actions';
import { computeProductsWithPrices } from 'calypso/state/products-list/selectors';
import {
	getPlan,
	findPlansKeys,
	GROUP_WPCOM,
	GROUP_JETPACK,
	TERM_ANNUALLY,
	TERM_BIENNIALLY,
	TERM_MONTHLY,
} from '@automattic/calypso-products';
import { requestProductsList } from 'calypso/state/products-list/actions';
import type { Plan } from '@automattic/calypso-products';
import type { WPCOMProductVariant } from '../components/item-variation-picker';

const debug = debugFactory( 'calypso:composite-checkout:product-variants' );

export interface AvailableProductVariant {
	planSlug: string;
	plan: Plan;
	product: {
		product_id: number;
		currency_code: string;
	};
	priceFullBeforeDiscount: number;
	priceFull: number;
	priceFinal: number;
}

const Discount = styled.span`
	color: ${ ( props ) => props.theme.colors.discount };
	margin-right: 8px;

	.rtl & {
		margin-right: 0;
		margin-left: 8px;
	}
`;

const DoNotPayThis = styled.span`
	text-decoration: line-through;
	margin-right: 8px;

	.rtl & {
		margin-right: 0;
		margin-left: 8px;
	}
`;

export function useGetProductVariants(
	siteId: number | undefined,
	productSlug: string
): WPCOMProductVariant[] {
	const translate = useTranslate();
	const reduxDispatch = useDispatch();

	const variantProductSlugs = useVariantPlanProductSlugs( productSlug );
	debug( 'variantProductSlugs', variantProductSlugs );

	const productsWithPrices = useSelector( ( state ) => {
		return computeProductsWithPrices( state, siteId, variantProductSlugs, 0, {} );
	} );
	debug( 'productsWithPrices', productsWithPrices );

	const [ haveFetchedProducts, setHaveFetchedProducts ] = useState( false );
	const shouldFetchProducts = ! productsWithPrices;

	useEffect( () => {
		debug( 'deciding whether to request product variant data' );
		if ( shouldFetchProducts && ! haveFetchedProducts ) {
			debug( 'dispatching request for product variant data' );
			reduxDispatch( requestPlans() );
			reduxDispatch( requestProductsList() );
			setHaveFetchedProducts( true );
		}
	}, [ shouldFetchProducts, haveFetchedProducts, reduxDispatch ] );

	const getProductVariantFromAvailableVariant = useCallback(
		( variant: AvailableProductVariant ): WPCOMProductVariant => {
			return {
				variantLabel: getTermText( variant.plan.term, translate ),
				variantDetails: <VariantPrice variant={ variant } />,
				productSlug: variant.planSlug,
				productId: variant.product.product_id,
			};
		},
		[ translate ]
	);

	return useMemo( () => productsWithPrices.map( getProductVariantFromAvailableVariant ), [
		productsWithPrices,
		getProductVariantFromAvailableVariant,
	] );
}

function VariantPrice( { variant }: { variant: AvailableProductVariant } ) {
	const currentPrice = variant.priceFinal || variant.priceFull;
	const isDiscounted = currentPrice !== variant.priceFullBeforeDiscount;
	return (
		<React.Fragment>
			{ isDiscounted && <VariantPriceDiscount variant={ variant } /> }
			{ isDiscounted && (
				<DoNotPayThis>
					{ myFormatCurrency( variant.priceFullBeforeDiscount, variant.product.currency_code ) }
				</DoNotPayThis>
			) }
			{ myFormatCurrency( currentPrice, variant.product.currency_code ) }
		</React.Fragment>
	);
}

function VariantPriceDiscount( { variant }: { variant: AvailableProductVariant } ) {
	const translate = useTranslate();
	const discountPercentage = Math.round(
		100 - ( variant.priceFinal / variant.priceFullBeforeDiscount ) * 100
	);
	return (
		<Discount>
			{ translate( 'Save %(percent)s%%', {
				args: {
					percent: discountPercentage,
				},
			} ) }
		</Discount>
	);
}

function useVariantPlanProductSlugs( productSlug: string | undefined ): string[] {
	const chosenPlan = getPlan( productSlug );

	if ( ! chosenPlan ) {
		return [];
	}

	// Only construct variants for WP.com and Jetpack plans
	if ( chosenPlan.group !== GROUP_WPCOM && chosenPlan.group !== GROUP_JETPACK ) {
		return [];
	}

	// : WPCOMProductSlug[]
	return findPlansKeys( {
		group: chosenPlan.group,
		type: chosenPlan.type,
	} );
}

function getTermText( term: string, translate: ReturnType< typeof useTranslate > ): string {
	switch ( term ) {
		case TERM_BIENNIALLY:
			return String( translate( 'Two years' ) );

		case TERM_ANNUALLY:
			return String( translate( 'One year' ) );

		case TERM_MONTHLY:
			return String( translate( 'One month' ) );
		default:
			return '';
	}
}

function myFormatCurrency( price: number, code: string, options = {} ) {
	const precision = CURRENCIES[ code ].precision;
	const EPSILON = Math.pow( 10, -precision ) - 0.000000001;

	const hasCents = Math.abs( price % 1 ) >= EPSILON;
	return formatCurrency( price, code, hasCents ? options : { ...options, precision: 0 } );
}
