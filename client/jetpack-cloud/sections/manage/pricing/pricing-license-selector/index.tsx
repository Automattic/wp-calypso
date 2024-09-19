import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { getSupportedBundleSizes } from 'calypso/jetpack-cloud/sections/partner-portal/primary/issue-license/hooks/use-product-bundle-size';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { usePublicProductsQuery } from 'calypso/state/partner-portal/licenses/hooks/use-products-query';

import './style.scss';

interface PricingLicenseSelectorProps {
	selectedSize: number;
	setSelectedSize: ( size: number ) => void;
}

export default function PricingLicenseSelector( {
	selectedSize,
	setSelectedSize,
}: PricingLicenseSelectorProps ) {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const { data: products } = usePublicProductsQuery();
	const supportedBundleSizes = getSupportedBundleSizes( products );

	const navItems = supportedBundleSizes.map( ( size ) => {
		return {
			key: size,
			label:
				size === 1
					? translate( 'Single license' )
					: ( translate( '%(size)d licenses', {
							args: { size },
					  } ) as string ),
			selected: selectedSize === size,
			onClick: () => {
				setSelectedSize( size );
				dispatch(
					recordTracksEvent( 'calypso_jetpack_manage_pricing_license_selector_tab_click', {
						bundle_size: size,
					} )
				);
			},
		};
	} );

	return (
		<div className="pricing-license-selector-wrapper">
			<div className="pricing-license-selector">
				{ navItems.map( ( item, index ) => (
					<div key={ item.key } className="pricing-license-option-outer">
						<button
							key={ index }
							onClick={ item.onClick }
							className={ clsx( 'pricing-license-option', { 'is-selected': item.selected } ) }
						>
							{ item.label }
						</button>
					</div>
				) ) }
			</div>
		</div>
	);
}
