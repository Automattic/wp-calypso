import { Button } from '@automattic/components';
import { addQueryArgs } from '@wordpress/url';
import 'calypso/my-sites/plans/jetpack-plans/product-store/featured-item-card/style.scss';
import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useProductDescription } from 'calypso/jetpack-cloud/sections/partner-portal/hooks';
import getProductShortTitle from 'calypso/jetpack-cloud/sections/partner-portal/lib/get-product-short-title';
import { HeroImageAPIFamily } from 'calypso/my-sites/plans/jetpack-plans/product-store/hero-image';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { isAgencyUser } from 'calypso/state/partner-portal/partner/selectors';
import { APIProductFamilyProduct } from 'calypso/state/partner-portal/types';
import { ItemPrice } from './item-price';

type FeaturedLicenseItemCardProps = {
	item: APIProductFamilyProduct;
	bundleSize?: number;
	ctaAsPrimary?: boolean;
	moreInfoLink?: React.ReactNode;
	isCondensedVersion?: boolean;
	isCtaDisabled?: boolean;
	isCtaExternal?: boolean;
	onClickCta?: VoidFunction;
};

export const FeaturedLicenseItemCard = ( {
	item,
	bundleSize,
	ctaAsPrimary,
	moreInfoLink,
	isCtaDisabled,
	isCtaExternal,
	onClickCta,
}: FeaturedLicenseItemCardProps ) => {
	const translate = useTranslate();

	const title = getProductShortTitle( item, false );
	const isLoggedIn = useSelector( isUserLoggedIn );
	const isAgency = useSelector( isAgencyUser );

	const ctaLabel = translate( 'Get' );
	const ctaAriaLabel = ctaLabel + ' ' + item.name;

	const getIssueLicenseURL = useCallback(
		( item: APIProductFamilyProduct, bundleSize: number | undefined ) => {
			if ( isLoggedIn ) {
				if ( isAgency ) {
					return addQueryArgs( `/partner-portal/issue-license/`, {
						product_slug: item.slug,
						source: 'manage-pricing-page',
						bundle_size: bundleSize,
					} );
				}
				return addQueryArgs( `/manage/signup/`, {
					product_slug: item.slug,
					source: 'manage-pricing-page',
					bundle_size: bundleSize,
				} );
			}
			return '#';
		},
		[ isLoggedIn, isAgency ]
	);

	const price = <ItemPrice bundleSize={ bundleSize } item={ item } />;
	const { description: productDescription } = useProductDescription( item.slug );
	const hero = <HeroImageAPIFamily item={ item } />;

	return (
		<div className="featured-item-card">
			<div className="featured-item-card--hero">{ hero }</div>

			<div className="featured-item-card--body">
				<div>
					<h3 className="featured-item-card--title">{ title }</h3>
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
						href={ isCtaDisabled ? '#' : getIssueLicenseURL( item, bundleSize ) }
						aria-label={ ctaAriaLabel }
					>
						{ ctaLabel }
					</Button>
				</div>
			</div>
		</div>
	);
};
