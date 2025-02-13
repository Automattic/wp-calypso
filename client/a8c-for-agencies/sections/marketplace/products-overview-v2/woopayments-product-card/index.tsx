import { Button } from '@wordpress/components';
import { check } from '@wordpress/icons';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useMemo, KeyboardEvent } from 'react';
import WooPaymentsLogo from 'calypso/assets/images/a8c-for-agencies/product-logos/woopayments.svg';
import LicenseLightboxLink from 'calypso/jetpack-cloud/sections/partner-portal/license-lightbox-link';
import withProductLightbox, {
	ProductLightboxActivatorProps,
	WithProductLightboxProps,
} from '../hocs/with-product-lightbox';

import './style.scss';

type Props = WithProductLightboxProps &
	ProductLightboxActivatorProps & {
		suggestedProduct?: string | null;
		hideDiscount?: boolean;
	};

function WooPaymentsProductCard( {
	asReferral,
	product,
	isSelected,
	onSelectProduct,
	quantity,
	onShowLightbox,
}: Props ) {
	const translate = useTranslate();

	const onSelect = useCallback( () => {
		onSelectProduct?.( product );
	}, [ onSelectProduct, product ] );

	const onKeyDown = useCallback(
		( e: KeyboardEvent ) => {
			// Enter
			if ( 'Enter' === e.code ) {
				onSelect();
			}
		},
		[ onSelect ]
	);

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

	return (
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
						className={ clsx( 'product-card__button', { 'is-selected': isSelected } ) }
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
	);
}

export default withProductLightbox( WooPaymentsProductCard );
