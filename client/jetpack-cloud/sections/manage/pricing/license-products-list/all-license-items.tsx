import classNames from 'classnames';
import { useSelector } from 'react-redux';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { isAgencyUser } from 'calypso/state/partner-portal/partner/selectors';
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
	const wrapperClassName = classNames( 'jetpack-product-store__all-items', className );
	const isLoggedIn = useSelector( isUserLoggedIn );
	const isAgency = useSelector( isAgencyUser );

	const getIssueLicenseURL = ( item: APIProductFamilyProduct, bundleSize: number | undefined ) => {
		if ( isLoggedIn ) {
			if ( isAgency ) {
				return `https://cloud.jetpack.com/partner-portal/issue-license?product_slug=${ item.slug }&bundle_size=${ bundleSize }`;
			}
			return `https://cloud.jetpack.com/manage/signup?issue-license=yes&product_slug=${ item.slug }&bundle_size=${ bundleSize }`;
		}
		return '#';
	};

	return (
		<div className={ wrapperClassName }>
			<h2 className="jetpack-product-store__all-items--header">{ heading }</h2>
			<div className="jetpack-product-store__all-items--subheader">{ subHeading }</div>
			<ul className="jetpack-product-store__all-items--grid">
				{ items.map( ( item, idx ) => {
					if ( Array.isArray( item ) && bundleSize && bundleSize > 1 ) {
						item = item[ 0 ];
					}

					return (
						<li key={ idx } className="jetpack-product-store__most-popular--item">
							{ Array.isArray( item ) ? (
								<SimpleLicenseMultiItemCard
									variants={ item }
									bundleSize={ bundleSize }
									ctaAsPrimary={ true }
									ctaHref={ getIssueLicenseURL( item, bundleSize ) }
									isCtaDisabled={ false }
									isCtaExternal={ true }
								/>
							) : (
								<SimpleLicenseItemCard
									item={ item }
									bundleSize={ bundleSize }
									ctaAsPrimary={ true }
									ctaHref={ getIssueLicenseURL( item, bundleSize ) }
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
