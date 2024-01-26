import classNames from 'classnames';
import { APIProductFamilyProduct } from 'calypso/state/partner-portal/types';
import { SimpleLicenseItemCard } from './simple-license-item-card';
import { SimpleLicenseMultiItemCard } from './simple-license-multi-item-card';
import 'calypso/my-sites/plans/jetpack-plans/product-store/items-list/style-most-popular.scss';

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
								<SimpleLicenseMultiItemCard
									items={ item }
									bundleSize={ bundleSize }
									ctaAsPrimary={ true }
									ctaHref="#"
									isCtaDisabled={ false }
									isCtaExternal={ true }
								/>
							) : (
								<SimpleLicenseItemCard
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
