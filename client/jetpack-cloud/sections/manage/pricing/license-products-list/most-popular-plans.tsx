import clsx from 'clsx';
import { APIProductFamilyProduct } from 'calypso/state/partner-portal/types';
import { FeaturedLicenseItemCard } from './featured-license-item-card';
import { FeaturedLicenseMultiItemCard } from './featured-license-multi-item-card';
import 'calypso/my-sites/plans/jetpack-plans/product-store/items-list/style-most-popular.scss';

type MostPopularPlansProps = {
	className?: string;
	heading: string;
	subHeading?: string;
	items: APIProductFamilyProduct[];
	bundleSize?: number;
};

export const MostPopularPlans = ( {
	className,
	heading,
	subHeading,
	items,
	bundleSize,
}: MostPopularPlansProps ) => {
	const wrapperClassName = clsx( 'jetpack-product-store__most-popular', className );

	return (
		<div className={ wrapperClassName }>
			<h2 className="jetpack-product-store__most-popular--heading">{ heading }</h2>
			<div className="jetpack-product-store__most-popular--subheading">{ subHeading }</div>
			<ul className="jetpack-product-store__most-popular--items">
				{ items.map( ( item, idx ) => {
					if ( Array.isArray( item ) && bundleSize && bundleSize > 1 ) {
						item = item[ 0 ];
					}

					// If the product doesn't support bundles, force a bundle size of 1.
					const supportedBundleSize = item?.supported_bundles?.length > 0 ? bundleSize : 1;

					return (
						<li key={ idx } className="jetpack-product-store__most-popular--item">
							{ Array.isArray( item ) ? (
								<FeaturedLicenseMultiItemCard
									variants={ item }
									bundleSize={ supportedBundleSize }
									ctaAsPrimary
									isCtaDisabled={ false }
									isCtaExternal={ false }
								/>
							) : (
								<FeaturedLicenseItemCard
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
