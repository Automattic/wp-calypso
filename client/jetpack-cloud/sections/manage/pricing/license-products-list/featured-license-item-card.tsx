import { Button } from '@automattic/components';
import 'calypso/my-sites/plans/jetpack-plans/product-store/featured-item-card/style.scss';
import { useTranslate } from 'i18n-calypso';
import { useProductDescription } from 'calypso/jetpack-cloud/sections/partner-portal/hooks';
import getProductShortTitle from 'calypso/jetpack-cloud/sections/partner-portal/lib/get-product-short-title';
import { HeroImage } from 'calypso/my-sites/plans/jetpack-plans/product-store/hero-image';
import { APIProductFamilyProduct } from 'calypso/state/partner-portal/types';
import { ItemPrice } from './item-price';

type FeaturedLicenseItemCardProps = {
	item: APIProductFamilyProduct;
	bundleSize?: number;
	priceDiscount?: React.ReactNode;
	ctaAsPrimary?: boolean;
	ctaHref?: string;
	moreInfoLink?: React.ReactNode;
	isCondensedVersion?: boolean;
	isCtaDisabled?: boolean;
	isCtaExternal?: boolean;
	onClickCta?: VoidFunction;
};

export const FeaturedLicenseItemCard = ( {
	item,
	bundleSize,
	priceDiscount,
	ctaAsPrimary,
	ctaHref,
	moreInfoLink,
	isCtaDisabled,
	isCtaExternal,
	onClickCta,
}: FeaturedLicenseItemCardProps ) => {
	const translate = useTranslate();

	let title = item.name;
	if ( title.startsWith( 'Jetpack Security' ) ) {
		title.replace( 'Jetpack Security', 'Security' );
	}
	if ( title.startsWith( 'Jetpack VaultPress' ) ) {
		title.replace( 'Jetpack VaultPress', 'VaultPress Backup' );
	} else {
		title = getProductShortTitle( item, true );
	}
	const ctaLabel = translate( 'Get' );
	const ctaAriaLabel = ctaLabel + ' ' + item.name;

	const price = <ItemPrice bundleSize={ bundleSize } item={ item } siteId={ null } />;
	const { description: productDescription } = useProductDescription( item.slug );
	const hero = <HeroImage item={ item } />;

	return (
		<div className="featured-item-card">
			<div className="featured-item-card--hero">{ hero }</div>

			<div className="featured-item-card--body">
				<div>
					<h3 className="featured-item-card--title">
						{ title }
						{ priceDiscount ? priceDiscount : '' }
					</h3>
					<div className="featured-item-card--price">{ price }</div>
					<div className="featured-item-card--desc">{ productDescription }</div>
				</div>
				<div className="featured-item-card--footer">
					{ moreInfoLink }
					<Button
						className="featured-item-card--cta"
						primary={ ctaAsPrimary }
						onClick={ onClickCta }
						disabled={ isCtaDisabled }
						target={ isCtaExternal ? '_blank' : undefined }
						href={ isCtaDisabled ? '#' : ctaHref }
						aria-label={ ctaAriaLabel }
					>
						{ ctaLabel }
					</Button>
				</div>
			</div>
		</div>
	);
};
