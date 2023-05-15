import { Button } from '@automattic/components';
import formatCurrency from '@automattic/format-currency';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { APIProductFamilyProduct } from '../../../../state/partner-portal/types';
import { useProductDescription } from '../hooks';
import LicenseLightbox from '../license-lightbox';
import LicenseLightboxLink from '../license-lightbox-link';
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
	const [ showLightbox, setShowLightbox ] = useState( false );
	const translate = useTranslate();
	const dispatch = useDispatch();

	const onSelect = useCallback( () => {
		onSelectProduct( product );
	}, [ onSelectProduct, product ] );

	const { description: productDescription } = useProductDescription( product.slug );

	const onShowLightbox = useCallback(
		( e: React.MouseEvent< HTMLElement > ) => {
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
						<div className="license-bundle-card__price">
							{ formatCurrency( product.amount, product.currency ) }
						</div>
						<div className="license-bundle-card__price-interval">
							{ product.price_interval === 'day' && translate( '/USD per license per day' ) }
							{ product.price_interval === 'month' && translate( '/USD per license per month' ) }
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
}

LicenseBundleCard.defaultProps = {
	onSelectProduct: null,
};
