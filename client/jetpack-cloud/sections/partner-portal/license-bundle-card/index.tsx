import { isEnabled } from '@automattic/calypso-config';
import { Button } from '@automattic/components';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { APIProductFamilyProduct } from 'calypso/state/partner-portal/types';
import { useProductDescription, useURLQueryParams } from '../hooks';
import { getProductTitle, LICENSE_INFO_MODAL_ID } from '../lib';
import LicenseLightbox from '../license-lightbox';
import LicenseLightboxLink from '../license-lightbox-link';
import ProductPriceWithDiscount from '../primary/product-price-with-discount-info';

import './style.scss';

type Props = {
	isBusy: boolean;
	isDisabled: boolean;
	withBackground?: boolean;
	tabIndex: number;
	product: APIProductFamilyProduct;
	onSelectProduct?: ( value: APIProductFamilyProduct ) => void;
	hideDiscount?: boolean;
};

const LicenseBundleCard = ( {
	isBusy = false,
	isDisabled = false,
	withBackground = isEnabled( 'jetpack/bundle-licensing' ),
	tabIndex,
	product,
	onSelectProduct,
	hideDiscount,
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
			<div
				className={ classNames( 'license-bundle-card', {
					'license-bundle-card--with-background': withBackground,
				} ) }
			>
				<div className="license-bundle-card__details">
					<h3 className="license-bundle-card__title">{ productTitle }</h3>

					<div className="license-bundle-card__description">{ productDescription }</div>

					<LicenseLightboxLink productName={ productTitle } onClick={ onShowLightbox } />
				</div>

				<div className="license-bundle-card__footer">
					<div className="license-bundle-card__pricing">
						<ProductPriceWithDiscount product={ product } hideDiscount={ hideDiscount } />
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
