import classNames from 'classnames';
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
	const wrapperClassName = classNames( 'jetpack-product-store__most-popular', className );

	return (
		<div className={ wrapperClassName }>
			<h2 className="jetpack-product-store__most-popular--heading">{ heading }</h2>
			<div className="jetpack-product-store__most-popular--subheading">{ subHeading }</div>
			<ul className="jetpack-product-store__most-popular--items">
				{ items.map( ( item, idx ) => {
					if ( Array.isArray( item ) && bundleSize && bundleSize > 1 ) {
						item = item[ 0 ];
					}

					return (
						<li key={ idx } className="jetpack-product-store__most-popular--item">
							{ Array.isArray( item ) ? (
								<FeaturedLicenseMultiItemCard
									items={ item }
									bundleSize={ bundleSize }
									ctaAsPrimary={ true }
									ctaHref="#"
									isCtaDisabled={ false }
									isCtaExternal={ true }
								/>
							) : (
								<FeaturedLicenseItemCard
									item={ item }
									bundleSize={ bundleSize }
									ctaAsPrimary={ true }
									ctaHref="#"
									isCtaDisabled={ false }
									isCtaExternal={ true }
								/>
							) }
						</li>
					);
				} ) }
			</ul>
		</div>
	);
};
