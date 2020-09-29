/**
 * External dependencies
 */
import React, { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import { useSelector, useDispatch } from 'react-redux';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import { requestPlans } from 'state/plans/actions';
import { computeProductsWithPrices } from 'state/products-list/selectors';
import { getPlan, findPlansKeys } from 'lib/plans';
import {
	GROUP_WPCOM,
	GROUP_JETPACK,
	TERM_ANNUALLY,
	TERM_BIENNIALLY,
	TERM_MONTHLY,
} from 'lib/plans/constants';
import { requestProductsList } from 'state/products-list/actions';
import { myFormatCurrency } from 'blocks/subscription-length-picker';

const debug = debugFactory( 'calypso:composite-checkout:product-variants' );

export function useProductVariants( { siteId, productSlug } ) {
	const translate = useTranslate();
	const reduxDispatch = useDispatch();

	const variantProductSlugs = useVariantPlanProductSlugs( productSlug );

	const productsWithPrices = useSelector( ( state ) => {
		return computeProductsWithPrices(
			state,
			siteId,
			variantProductSlugs, // : WPCOMProductSlug[]
			0, // coupon: number
			{} // couponDiscounts: object of product ID / absolute amount pairs
		);
	} );

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

	return ( anyProductSlug ) => {
		if ( anyProductSlug !== productSlug ) {
			return [];
		}

		return productsWithPrices.map( ( variant ) => ( {
			variantLabel: getTermText( variant.plan.term, translate ),
			variantDetails: <VariantPrice variant={ variant } />,
			productSlug: variant.planSlug,
			productId: variant.product.product_id,
		} ) );
	};
}

function VariantPrice( { variant } ) {
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

function VariantPriceDiscount( { variant } ) {
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

function useVariantPlanProductSlugs( productSlug ) {
	const reduxDispatch = useDispatch();

	const chosenPlan = getPlan( productSlug );

	const [ haveFetchedPlans, setHaveFetchedPlans ] = useState( false );
	const shouldFetchPlans = ! chosenPlan;

	useEffect( () => {
		// Trigger at most one HTTP request
		debug( 'deciding whether to request plan variant data' );
		if ( shouldFetchPlans && ! haveFetchedPlans ) {
			debug( 'dispatching request for plan variant data' );
			reduxDispatch( requestPlans() );
			reduxDispatch( requestProductsList() );
			setHaveFetchedPlans( true );
		}
	}, [ haveFetchedPlans, shouldFetchPlans, reduxDispatch ] );

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

function getTermText( term, translate ) {
	switch ( term ) {
		case TERM_BIENNIALLY:
			return translate( 'Two years' );

		case TERM_ANNUALLY:
			return translate( 'One year' );

		case TERM_MONTHLY:
			return translate( 'One month' );
	}
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
