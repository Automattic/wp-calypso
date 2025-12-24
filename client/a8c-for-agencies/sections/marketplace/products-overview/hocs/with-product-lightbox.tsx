import { useTranslate } from 'i18n-calypso';
import { ComponentType, useCallback, useMemo, useState } from 'react';
import { useURLQueryParams } from 'calypso/jetpack-cloud/sections/partner-portal/hooks';
import { LICENSE_INFO_MODAL_ID } from 'calypso/jetpack-cloud/sections/partner-portal/lib';
import LicenseLightbox from 'calypso/jetpack-cloud/sections/partner-portal/license-lightbox';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getVendorInfo } from '../lib/get-vendor-info';
import WooCustomFooter from '../product-card/woo-custom-footer';
import WooPaymentsCustomDescription from '../product-card/woopayments-custom-description';
import WooPaymentsRevenueShareNotice from '../product-card/woopayments-revenue-share-notice';
import type { TermPricingType } from '../../types';
import type { APIProductFamilyProduct as APIProductFamilyProductA4A } from 'calypso/a8c-for-agencies/types/products';
import type { APIProductFamilyProduct } from 'calypso/state/partner-portal/types';

export type WithProductLightboxProps = {
	products: APIProductFamilyProductA4A[];
	isSelected?: boolean;
	quantity?: number;
	onSelectProduct: (
		value: APIProductFamilyProductA4A,
		replace?: APIProductFamilyProductA4A
	) => void | null;
	asReferral?: boolean;
	termPricing: TermPricingType;
	isDisabled?: boolean;
	customCTALabel?: string;
};

export type ProductLightboxActivatorProps = {
	currentProduct: APIProductFamilyProductA4A;
	setCurrentProduct: ( product: APIProductFamilyProductA4A ) => void;
	onShowLightbox: ( e: React.MouseEvent< HTMLElement > ) => void;
};

function withProductLightbox< T >(
	WrappedComponent: ComponentType< T & WithProductLightboxProps & ProductLightboxActivatorProps >
): ComponentType< T & WithProductLightboxProps > {
	const WithProductLightboxComponent = (
		props: T & WithProductLightboxProps & ProductLightboxActivatorProps
	) => {
		const {
			isSelected,
			quantity,
			onSelectProduct,
			asReferral,
			isDisabled,
			products,
			customCTALabel,
			termPricing,
		} = props;

		const translate = useTranslate();
		const dispatch = useDispatch();

		const [ currentProduct, setCurrentProduct ] = useState( products[ 0 ] );

		const { setParams, resetParams, getParamValue } = useURLQueryParams();
		const modalParamValue = getParamValue( LICENSE_INFO_MODAL_ID );
		const [ showLightbox, setShowLightbox ] = useState( modalParamValue === currentProduct.slug );

		const onShowLightbox = useCallback(
			( e: React.MouseEvent< HTMLElement > ) => {
				e.stopPropagation();

				dispatch(
					recordTracksEvent( 'calypso_marketplace_products_overview_product_view', {
						product: currentProduct.slug,
					} )
				);

				setParams( [
					{
						key: LICENSE_INFO_MODAL_ID,
						value: currentProduct.slug,
					},
				] );

				setShowLightbox( true );
			},
			[ currentProduct.slug, dispatch, setParams ]
		);

		const onHideLightbox = useCallback( () => {
			resetParams( [ LICENSE_INFO_MODAL_ID ] );
			setShowLightbox( false );
		}, [ resetParams ] );

		const ctaLightboxLabel = useMemo( () => {
			const selectedQuantity = quantity ?? 1;

			if ( asReferral ) {
				return isSelected ? translate( 'Remove from referral' ) : translate( 'Add to referral' );
			}

			if ( selectedQuantity > 1 ) {
				return isSelected
					? translate( 'Remove %(quantity)s from cart', { args: { quantity: selectedQuantity } } )
					: translate( 'Add %(quantity)s to cart', { args: { quantity: selectedQuantity } } );
			}

			return isSelected ? translate( 'Remove from cart' ) : translate( 'Add to cart' );
		}, [ asReferral, isSelected, quantity, translate ] );

		const customDescription = useMemo( () => {
			if ( currentProduct.slug === 'woocommerce-woopayments' ) {
				return <WooPaymentsCustomDescription />;
			}

			return undefined;
		}, [ currentProduct.slug ] );

		const customFooter = useMemo( () => {
			if ( currentProduct.slug.startsWith( 'woocommerce-' ) ) {
				return <WooCustomFooter productSlug={ currentProduct.slug } />;
			}

			return undefined;
		}, [ currentProduct.slug ] );

		const extraAsideContent = useMemo( () => {
			if ( currentProduct.slug === 'woocommerce-woopayments' ) {
				return <WooPaymentsRevenueShareNotice />;
			}

			return undefined;
		}, [ currentProduct.slug ] );

		const vendor = getVendorInfo( currentProduct.slug );

		const handleActivate = useCallback(
			( product: APIProductFamilyProduct | APIProductFamilyProductA4A ): void => {
				onSelectProduct( product as APIProductFamilyProductA4A );
			},
			[ onSelectProduct ]
		);

		return (
			<>
				<WrappedComponent
					{ ...props }
					currentProduct={ currentProduct }
					setCurrentProduct={ setCurrentProduct }
					onShowLightbox={ onShowLightbox }
				/>
				{ showLightbox && (
					<LicenseLightbox
						vendor={ vendor }
						product={ currentProduct }
						quantity={ quantity }
						ctaLabel={ customCTALabel ?? ( ctaLightboxLabel as string ) }
						isCTAPrimary={ ! isSelected }
						isDisabled={ isDisabled }
						onActivate={ handleActivate }
						onClose={ onHideLightbox }
						customDescription={ customDescription }
						customFooter={ customFooter }
						extraAsideContent={ extraAsideContent }
						termPricing={ termPricing }
					/>
				) }
			</>
		);
	};

	const wrappedComponentName = WrappedComponent.displayName || WrappedComponent.name || 'Component';
	WithProductLightboxComponent.displayName = `WithProductLightbox(${ wrappedComponentName })`;

	// Explicitly cast the return so TS knows it conforms to ComponentType<T & WithProductLightboxProps>
	return WithProductLightboxComponent as React.ComponentType< T & WithProductLightboxProps >;
}

export default withProductLightbox;
