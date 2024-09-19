import clsx from 'clsx';
import { APIProductFamilyProduct } from 'calypso/state/partner-portal/types';
import { SimpleLicenseItemCard } from './simple-license-item-card';
import { SimpleLicenseMultiItemCard } from './simple-license-multi-item-card';
import 'calypso/my-sites/plans/jetpack-plans/product-store/items-list/style-most-popular.scss';
import 'calypso/my-sites/plans/jetpack-plans/product-store/items-list/style.scss';

type AllLicenseItemsProps = {
	className?: string;
	heading: string;
	subHeading?: string;
	items: APIProductFamilyProduct[];
	bundleSize?: number;
};

export const AllLicenseItems = ( {
	className,
	heading,
	subHeading,
	items,
	bundleSize,
}: AllLicenseItemsProps ) => {
	const wrapperClassName = clsx( 'jetpack-product-store__all-items', className );

	return (
		<div className={ wrapperClassName }>
			<h2 className="jetpack-product-store__all-items--header">{ heading }</h2>
			<div className="jetpack-product-store__all-items--subheader">{ subHeading }</div>
			<ul className="jetpack-product-store__all-items--grid">
				{ items.map( ( item, idx ) => {
					if ( Array.isArray( item ) && bundleSize && bundleSize > 1 ) {
						item = item[ 0 ];
					}

					// If the product doesn't support bundles, force a bundle size of 1.
					const supportedBundleSize = item?.supported_bundles?.length > 0 ? bundleSize : 1;

					return (
						<li key={ idx } className="jetpack-product-store__most-popular--item">
							{ Array.isArray( item ) ? (
								<SimpleLicenseMultiItemCard
									variants={ item }
									bundleSize={ supportedBundleSize }
									ctaAsPrimary
									isCtaDisabled={ false }
									isCtaExternal={ false }
								/>
							) : (
								<SimpleLicenseItemCard
									item={ item }
									bundleSize={ supportedBundleSize }
									ctaAsPrimary
									isCtaDisabled={ false }
									isCtaExternal={ false }
								/>
							) }
						</li>
					);
				} ) }
			</ul>
		</div>
	);
};
