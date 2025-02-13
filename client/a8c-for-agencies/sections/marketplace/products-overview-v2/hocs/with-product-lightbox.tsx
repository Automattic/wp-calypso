import { useTranslate } from 'i18n-calypso';
import { ComponentType, useCallback, useMemo, useState } from 'react';
import { useURLQueryParams } from 'calypso/jetpack-cloud/sections/partner-portal/hooks';
import { LICENSE_INFO_MODAL_ID } from 'calypso/jetpack-cloud/sections/partner-portal/lib';
import LicenseLightbox from 'calypso/jetpack-cloud/sections/partner-portal/license-lightbox';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { APIProductFamilyProduct } from 'calypso/state/partner-portal/types';
import WooPaymentsCustomDescription from '../product-card/woopayments-custom-description';
import WooPaymentsCustomFooter from '../product-card/woopayments-custom-footer';
import WooPaymentsRevenueShareNotice from '../product-card/woopayments-revenue-share-notice';

export type WithProductLightboxProps = {
	product: APIProductFamilyProduct;
	isSelected: boolean;
	quantity?: number;
	onSelectProduct: ( value: APIProductFamilyProduct ) => void | null;
	asReferral?: boolean;
	isDisabled?: boolean;
};

export type ProductLightboxActivatorProps = {
	onShowLightbox: ( e: React.MouseEvent< HTMLElement > ) => void;
};

function withProductLightbox< T >(
	WrappedComponent: ComponentType< T & WithProductLightboxProps & ProductLightboxActivatorProps >
): ComponentType< T & WithProductLightboxProps > {
	return ( props ) => {
		const translate = useTranslate();
		const dispatch = useDispatch();

		const { product, isSelected, quantity, onSelectProduct, asReferral, isDisabled } = props;

		const { setParams, resetParams, getParamValue } = useURLQueryParams();
		const modalParamValue = getParamValue( LICENSE_INFO_MODAL_ID );
		const [ showLightbox, setShowLightbox ] = useState( modalParamValue === product.slug );

		const onShowLightbox = useCallback(
			( e: React.MouseEvent< HTMLElement > ) => {
				e.stopPropagation();

				dispatch(
					recordTracksEvent( 'calypso_marketplace_products_overview_product_view', {
						product: product.slug,
					} )
				);

				setParams( [
					{
						key: LICENSE_INFO_MODAL_ID,
						value: product.slug,
					},
				] );
				setShowLightbox( true );
			},
			[ dispatch, product.slug, setParams ]
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
			if ( product.slug === 'woocommerce-woopayments' ) {
				return <WooPaymentsCustomDescription />;
			}

			return undefined;
		}, [ product.slug ] );

		const customFooter = useMemo( () => {
			if ( product.slug === 'woocommerce-woopayments' ) {
				return <WooPaymentsCustomFooter />;
			}

			return undefined;
		}, [ product.slug ] );

		const extraAsideContent = useMemo( () => {
			if ( product.slug === 'woocommerce-woopayments' ) {
				return <WooPaymentsRevenueShareNotice />;
			}

			return undefined;
		}, [ product.slug ] );

		return (
			<>
				<WrappedComponent { ...props } onShowLightbox={ onShowLightbox } />
				{ showLightbox && (
					<LicenseLightbox
						product={ product }
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
