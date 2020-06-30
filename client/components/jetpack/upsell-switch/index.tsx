/**
 * External dependencies
 */
import React, { ReactElement, useState, ReactNode, useEffect, ComponentType, useMemo } from 'react';
import { connect, DefaultRootState } from 'react-redux';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import isJetpackCloud from 'lib/jetpack/is-jetpack-cloud';
import { getSelectedSiteId } from 'state/ui/selectors';
import isAtomicSite from 'state/selectors/is-site-wpcom-atomic';
import { getSiteProducts, getSitePlan } from 'state/sites/selectors';
import { getPlan } from 'lib/plans';

/**
 * Type dependencies
 */
import type { SiteProduct } from 'state/sites/selectors/get-site-products';
import type { SitePlan } from 'state/sites/selectors/get-site-plan';

type QueryComponentProps = {
	siteId: number | null;
};

type QueryFunction = ( arg0: DefaultRootState, arg1: number | null ) => SiteState;
type RequestFunction = ( arg0: DefaultRootState, arg1: number | null ) => boolean;

export type UpsellComponentProps = {
	reason?: string;
};

type SiteState = {
	state: string;
	reason?: string;
};

type Props = {
	children: ReactNode;
	UpsellComponent: ComponentType< UpsellComponentProps >;
	display: ReactElement;
	QueryComponent: ComponentType< QueryComponentProps >;
	getStateForSite: QueryFunction;
	isRequestingForSite: RequestFunction;
	isRequesting: boolean;
	productSlugTest?: ( slug: string ) => boolean;
	siteId: number | null;
	siteState: SiteState | null;
	atomicSite: boolean;
	siteProducts: SiteProduct[] | null;
	sitePlan: SitePlan | null;
};

const UI_STATE_LOADING = Symbol();
const UI_STATE_LOADED = Symbol();

type UiState = typeof UI_STATE_LOADED | typeof UI_STATE_LOADING | null;

function UpsellSwitch( props: Props ): React.ReactElement {
	const {
		UpsellComponent,
		QueryComponent,
		display,
		children,
		siteId,
		siteState,
		atomicSite,
		isRequesting,
		siteProducts,
		sitePlan,
		productSlugTest,
	} = props;
	const { state, reason } = siteState || {};

	const [ uiState, setUiState ] = useState< UiState >( null );
	const [ showUpsell, setUpsell ] = useState( false );

	// Returns true if this product is present, either as a product or in the plan.
	const hasProduct = useMemo( () => {
		if ( ! productSlugTest || ( ! siteProducts && ! sitePlan ) ) {
			return false;
		}
		let productsList: string[] = [];
		if ( siteProducts ) {
			productsList = siteProducts.map( ( { productSlug } ) => productSlug );
		}
		if ( sitePlan ) {
			const sitePlanDetails = getPlan( sitePlan.product_slug );
			productsList = [
				...productsList,
				...sitePlanDetails.getHiddenFeatures(),
				...sitePlanDetails.getInferiorHiddenFeatures(),
			];
		}
		return !! productsList.find( productSlugTest );
	}, [ siteProducts, productSlugTest, sitePlan ] ) as boolean;

	// Reset states when site or section changes
	useEffect( () => {
		setUiState( null );
		setUpsell( false );
	}, [ siteId, QueryComponent ] );

	// The data queried by QueryComponent can be fetched at any time by other
	// parts of the app and therefore trigger a rendering of the loading state.
	// We want to prevent that by making sure the component renders its loading
	// state only once while mounted.
	useEffect( () => {
		if ( ! uiState ) {
			if ( isRequesting ) {
				setUiState( UI_STATE_LOADING );
			} else if ( state ) {
				setUiState( UI_STATE_LOADED );
			}
		}
		if ( UI_STATE_LOADING === uiState && ! isRequesting ) {
			setUiState( UI_STATE_LOADED );
		}
	}, [ uiState, isRequesting, state ] );

	useEffect( () => {
		// Show the expected content only if the state is distinct to unavailable
		// (active, inactive, provisioning) or if the site is Atomic
		if (
			UI_STATE_LOADED === uiState &&
			! atomicSite &&
			! hasProduct &&
			( ! state || state === 'unavailable' )
		) {
			setUpsell( true );
		}
	}, [ uiState, atomicSite, hasProduct, state ] );

	if ( UI_STATE_LOADED !== uiState ) {
		return (
			<Main
				className={ classNames( 'upsell-switch__loading', { is_jetpackcom: isJetpackCloud() } ) }
			>
				<QueryComponent siteId={ siteId } />
				{ children }
			</Main>
		);
	}
	if ( showUpsell ) {
		return <UpsellComponent reason={ reason } />;
	}
	return display;
}

export default connect( ( state, { getStateForSite, isRequestingForSite }: Props ) => {
	const siteId = getSelectedSiteId( state );
	const siteState = getStateForSite( state, siteId );
	const atomicSite = ( siteId && isAtomicSite( state, siteId ) ) as boolean;
	const siteProducts = getSiteProducts( state, siteId );
	const sitePlan = getSitePlan( state, siteId );

	return {
		siteId,
		siteState,
		atomicSite,
		siteProducts,
		sitePlan,
		isRequesting: isRequestingForSite( state, siteId ),
	};
} )( UpsellSwitch );
