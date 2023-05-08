import { Button } from '@automattic/components';
import formatCurrency from '@automattic/format-currency';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import LicenseBundleCardDescription from 'calypso/jetpack-cloud/sections/partner-portal/license-bundle-card-description';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { APIProductFamilyProduct } from '../../../../state/partner-portal/types';
import LicenseProductLightbox from '../license-product-lightbox';
import { getProductTitle } from '../utils';

import './style.scss';

interface Props {
	tabIndex: number;
	product: APIProductFamilyProduct;
	onSelectProduct: ( value: APIProductFamilyProduct ) => void | null;
}

export default function LicenseBundleCard( props: Props ) {
	const { tabIndex, product, onSelectProduct } = props;
	const productTitle = getProductTitle( product.name );
	const translate = useTranslate();
	const dispatch = useDispatch();
	const [ showLightbox, setShowLightbox ] = useState( false );

	const onShowLightbox = useCallback(
		( e: any ) => {
			e.stopPropagation();

			dispatch(
				recordTracksEvent( 'calypso_partner_portal_issue_license_product_view', {
					product: product.slug,
				} )
			);

			setShowLightbox( true );
		},
		[ dispatch, product ]
	);

	const onHideLightbox = useCallback( () => {
		setShowLightbox( false );
	}, [] );

	const onSelect = () => {
		onSelectProduct( product );
	};

	return (
		<>
			<div className="license-bundle-card">
				<div className="license-bundle-card__details">
					<h3 className="license-bundle-card__title">{ productTitle }</h3>
					<LicenseBundleCardDescription product={ product } />

					<Button className="license-bundle-card__more-info-link" onClick={ onShowLightbox } plain>
						{ translate( 'Learn more' ) }
					</Button>

					<div className="license-bundle-card__pricing">
						<div className="license-bundle-card__price">
							{ formatCurrency( product.amount, product.currency ) }
						</div>
						<div className="license-bundle-card__price-interval">
							{ product.price_interval === 'day' && translate( '/USD per license per day' ) }
							{ product.price_interval === 'month' && translate( '/USD per license per month' ) }
						</div>
					</div>
				</div>
				<Button
					primary
					className="license-bundle-card__select-license"
					onClick={ onSelect }
					tabIndex={ tabIndex }
				>
					{ translate( 'Select' ) }
				</Button>
			</div>

			{ showLightbox && (
				<LicenseProductLightbox
					ctaLabel={ translate( 'Select License' ) }
					product={ product }
					onActivate={ onSelect }
					onClose={ onHideLightbox }
				/>
			) }
		</>
	);
}

LicenseBundleCard.defaultProps = {
	onSelectProduct: null,
};
