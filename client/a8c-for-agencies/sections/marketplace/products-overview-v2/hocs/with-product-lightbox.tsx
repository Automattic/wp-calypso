import { useTranslate } from 'i18n-calypso';
import { ComponentType, useCallback, useMemo, useState } from 'react';
import { useURLQueryParams } from 'calypso/jetpack-cloud/sections/partner-portal/hooks';
import { LICENSE_INFO_MODAL_ID } from 'calypso/jetpack-cloud/sections/partner-portal/lib';
import LicenseLightbox from 'calypso/jetpack-cloud/sections/partner-portal/license-lightbox';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import WooPaymentsCustomDescription from '../product-card/woopayments-custom-description';
import WooPaymentsCustomFooter from '../product-card/woopayments-custom-footer';
import WooPaymentsRevenueShareNotice from '../product-card/woopayments-revenue-share-notice';
import type { APIProductFamilyProduct } from 'calypso/state/partner-portal/types';

export type WithProductLightboxProps = {
	products: APIProductFamilyProduct[];
	isSelected: boolean;
	quantity?: number;
	onSelectProduct: (
		value: APIProductFamilyProduct,
		replace?: APIProductFamilyProduct
	) => void | null;
	asReferral?: boolean;
	isDisabled?: boolean;
};

export type ProductLightboxActivatorProps = {
	currentProduct: APIProductFamilyProduct;
	setCurrentProduct: ( product: APIProductFamilyProduct ) => void;
	onShowLightbox: ( e: React.MouseEvent< HTMLElement > ) => void;
};

function withProductLightbox< T >(
	WrappedComponent: ComponentType< T & WithProductLightboxProps & ProductLightboxActivatorProps >
): ComponentType< T & WithProductLightboxProps > {
	return ( props ) => {
		const translate = useTranslate();
		const dispatch = useDispatch();

		const { isSelected, quantity, onSelectProduct, asReferral, isDisabled, products } = props;
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
			if ( currentProduct.slug === 'woocommerce-woopayments' ) {
				return <WooPaymentsCustomFooter />;
			}

			return undefined;
		}, [ currentProduct.slug ] );

		const extraAsideContent = useMemo( () => {
			if ( currentProduct.slug === 'woocommerce-woopayments' ) {
				return <WooPaymentsRevenueShareNotice />;
			}

			return undefined;
		}, [ currentProduct.slug ] );

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
						product={ currentProduct }
						quantity={ quantity }
						ctaLabel={ ctaLightboxLabel as string }
						isCTAPrimary={ ! isSelected }
						isDisabled={ isDisabled }
						onActivate={ onSelectProduct }
						onClose={ onHideLightbox }
						customDescription={ customDescription }
						customFooter={ customFooter }
						extraAsideContent={ extraAsideContent }
					/>
				) }
			</>
		);
	};
}

export default withProductLightbox;
