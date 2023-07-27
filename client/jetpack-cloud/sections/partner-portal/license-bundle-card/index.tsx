import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { APIProductFamilyProduct } from '../../../../state/partner-portal/types';
import { useProductDescription, useURLQueryParams } from '../hooks';
import LicenseLightbox from '../license-lightbox';
import LicenseLightboxLink from '../license-lightbox-link';
import ProductPriceWithDiscount from '../primary/product-price-with-discount-info';
import { getProductTitle, LICENSE_INFO_MODAL_ID } from '../utils';

import './style.scss';

type Props = {
	isBusy: boolean;
	isDisabled: boolean;
	tabIndex: number;
	product: APIProductFamilyProduct;
	onSelectProduct?: ( value: APIProductFamilyProduct ) => void;
};

const LicenseBundleCard = ( {
	isBusy = false,
	isDisabled = false,
	tabIndex,
	product,
	onSelectProduct,
}: Props ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const productTitle = getProductTitle( product.name );
	const { description: productDescription } = useProductDescription( product.slug );

	const { setParams, resetParams, getParamValue } = useURLQueryParams();
	const modalParamValue = getParamValue( LICENSE_INFO_MODAL_ID );
	const [ showLightbox, setShowLightbox ] = useState( modalParamValue === product.slug );
	const onShowLightbox = useCallback(
		( e: React.MouseEvent< HTMLElement > ) => {
			e.stopPropagation();

			dispatch(
				recordTracksEvent( 'calypso_partner_portal_issue_license_bundle_product_view', {
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

	const onSelect = useCallback( () => {
		onSelectProduct?.( product );
	}, [ onSelectProduct, product ] );

	return (
		<>
			<div className="license-bundle-card">
				<div className="license-bundle-card__details">
					<h3 className="license-bundle-card__title">{ productTitle }</h3>

					<div className="license-bundle-card__description">{ productDescription }</div>

					<LicenseLightboxLink productName={ productTitle } onClick={ onShowLightbox } />
				</div>

				<div className="license-bundle-card__footer">
					<div className="license-bundle-card__pricing">
						<ProductPriceWithDiscount product={ product } />
					</div>
					<Button
						primary
						busy={ isBusy }
						disabled={ isDisabled }
						className="license-bundle-card__select-license"
						onClick={ onSelect }
						tabIndex={ tabIndex }
					>
						{ translate( 'Select' ) }
					</Button>
				</div>
			</div>

			{ showLightbox && (
				<LicenseLightbox
					product={ product }
					ctaLabel={ translate( 'Select License' ) }
					onActivate={ onSelect }
					onClose={ onHideLightbox }
				/>
			) }
		</>
	);
};

export default LicenseBundleCard;
