import { Button } from '@wordpress/components';
import { check } from '@wordpress/icons';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useMemo, useState } from 'react';
import WooPaymentsLogo from 'calypso/assets/images/a8c-for-agencies/product-logos/woopayments.svg';
import { useURLQueryParams } from 'calypso/jetpack-cloud/sections/partner-portal/hooks';
import { LICENSE_INFO_MODAL_ID } from 'calypso/jetpack-cloud/sections/partner-portal/lib';
import LicenseLightbox from 'calypso/jetpack-cloud/sections/partner-portal/license-lightbox';
import LicenseLightboxLink from 'calypso/jetpack-cloud/sections/partner-portal/license-lightbox-link';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { APIProductFamilyProduct } from 'calypso/state/partner-portal/types';

import './style.scss';

interface Props {
	asReferral?: boolean;
	product: APIProductFamilyProduct;
	isSelected: boolean;
	onSelectProduct: ( value: APIProductFamilyProduct ) => void | null;
	suggestedProduct?: string | null;
	hideDiscount?: boolean;
	quantity?: number;
}

export default function WooPaymentsProductCard( {
	asReferral,
	product,
	isSelected,
	onSelectProduct,
	quantity,
}: Props ) {
	const { setParams, resetParams, getParamValue } = useURLQueryParams();
	const modalParamValue = getParamValue( LICENSE_INFO_MODAL_ID );

	const [ showLightbox, setShowLightbox ] = useState( modalParamValue === product.slug );
	const translate = useTranslate();
	const dispatch = useDispatch();

	const onSelect = useCallback( () => {
		onSelectProduct?.( product );
	}, [ onSelectProduct, product ] );

	const onKeyDown = useCallback(
		( e: any ) => {
			// Enter
			if ( 13 === e.keyCode ) {
				onSelect();
			}
		},
		[ onSelect ]
	);

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

	const ctaLabel = useMemo( () => {
		const selectedQuantity = quantity ?? 1;

		if ( asReferral ) {
			return isSelected ? translate( 'Added to referral' ) : translate( 'Add to referral' );
		}

		if ( selectedQuantity > 1 ) {
			return isSelected
				? translate( 'Added %(quantity)s to cart', { args: { quantity: selectedQuantity } } )
				: translate( 'Add %(quantity)s to cart', { args: { quantity: selectedQuantity } } );
		}

		return isSelected ? translate( 'Added to cart' ) : translate( 'Add to cart' );
	}, [ asReferral, isSelected, quantity, translate ] );

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

	return (
		<>
			<div
				onClick={ onSelect }
				onKeyDown={ onKeyDown }
				role="button"
				tabIndex={ 0 }
				className="product-card is-woopayments"
			>
				<div className="product-card__inner">
					<div className="product-card__details">
						<div className="product-card__main">
							<div className="product-card__heading">
								<img src={ WooPaymentsLogo } alt="WooPayments" />

								<h3 className="product-card__title">{ translate( 'Revenue share available' ) }</h3>

								<div className="product-card__description">
									{ translate(
										"Accept credit/debit cards and local payment options with no setup or monthly fees. Earn revenue share on transactions from your clients' sites within Automattic for Agencies."
									) }
								</div>
							</div>
						</div>
					</div>
					<div className="product-card__buttons">
						<Button
							className={ clsx( { 'is-selected': isSelected } ) }
							variant="primary"
							tabIndex={ -1 }
							icon={ isSelected ? check : undefined }
						>
							{ ctaLabel }
						</Button>

						<LicenseLightboxLink
							customText={ translate( 'View details' ) }
							productName={ product.name }
							onClick={ onShowLightbox }
							showIcon={ false }
						/>
					</div>
				</div>
			</div>
			{ showLightbox && (
				<LicenseLightbox
					product={ product }
					quantity={ quantity }
					ctaLabel={ ctaLightboxLabel as string }
					isCTAPrimary={ ! isSelected }
					onActivate={ onSelectProduct }
					onClose={ onHideLightbox }
				/>
			) }
		</>
	);
}
