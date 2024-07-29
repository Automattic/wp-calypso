import { getPlan } from '@automattic/calypso-products';
import clsx from 'clsx';
import {
	ReactElement,
	useState,
	PropsWithChildren,
	useEffect,
	ComponentType,
	useMemo,
} from 'react';
import * as React from 'react';
import { connect } from 'react-redux';
import Main from 'calypso/components/main';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import isAtomicSite from 'calypso/state/selectors/is-site-wpcom-atomic';
import { getSiteProducts, getSitePlan } from 'calypso/state/sites/selectors';
import { IAppState } from 'calypso/state/types';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import type { SitePlan } from 'calypso/state/sites/selectors/get-site-plan';
import type { SiteProduct } from 'calypso/state/sites/selectors/get-site-products';

type QueryComponentProps = {
	siteId: number | null;
};

type QueryFunction = ( arg0: IAppState, arg1: number | null ) => SiteState;
type RequestFunction = ( arg0: IAppState, arg1: number | null ) => boolean;

export type UpsellComponentProps = {
	reason?: string;
};

type SiteState = {
	state: string;
	reason?: string;
};

type Props = PropsWithChildren< {
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
	sitePlan: SitePlan | null | undefined;
} >;

const UI_STATE_LOADING = Symbol();
const UI_STATE_LOADED = Symbol();

type UiState = typeof UI_STATE_LOADED | typeof UI_STATE_LOADING | null;

function UpsellSwitch( props: Props ) {
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
				...( sitePlanDetails?.getIncludedFeatures?.() ?? [] ),
				...( sitePlanDetails?.getInferiorFeatures?.() ?? [] ),
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
		// Don't show an upsell until the page is loaded
		if ( UI_STATE_LOADED !== uiState ) {
			setUpsell( false );
			return;
		}

		// Don't show an upsell if this site already has the product in question
		if ( hasProduct ) {
			setUpsell( false );
			return;
		}

		// Only show an upsell if the state is 'unavailable'
		setUpsell( state === 'unavailable' );
	}, [ uiState, atomicSite, hasProduct, state ] );

	if ( UI_STATE_LOADED !== uiState ) {
		return (
			<Main className={ clsx( 'upsell-switch__loading', { is_jetpackcom: isJetpackCloud() } ) }>
				<QueryComponent siteId={ siteId } />
				{ /* render placeholder */ }
				{ children }
			</Main>
		);
	}
	if ( showUpsell ) {
		return <UpsellComponent reason={ reason } />;
	}
	return display;
}

export default connect( ( state: IAppState, { getStateForSite, isRequestingForSite }: Props ) => {
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
