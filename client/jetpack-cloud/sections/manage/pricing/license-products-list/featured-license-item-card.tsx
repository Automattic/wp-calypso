import page from '@automattic/calypso-router';
import { Button } from '@automattic/components';
import 'calypso/my-sites/plans/jetpack-plans/product-store/featured-item-card/style.scss';
import { addQueryArgs } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useState } from 'react';
import { useSelector } from 'react-redux';
import { useProductDescription } from 'calypso/jetpack-cloud/sections/partner-portal/hooks';
import { useURLQueryParams } from 'calypso/jetpack-cloud/sections/partner-portal/hooks/index';
import { LICENSE_INFO_MODAL_ID } from 'calypso/jetpack-cloud/sections/partner-portal/lib';
import getProductShortTitle from 'calypso/jetpack-cloud/sections/partner-portal/lib/get-product-short-title';
import LicenseLightbox from 'calypso/jetpack-cloud/sections/partner-portal/license-lightbox/index';
import LicenseLightboxLink from 'calypso/jetpack-cloud/sections/partner-portal/license-lightbox-link/index';
import { HeroImageAPIFamily } from 'calypso/my-sites/plans/jetpack-plans/product-store/hero-image';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { isAgencyUser } from 'calypso/state/partner-portal/partner/selectors';
import { APIProductFamilyProduct } from 'calypso/state/partner-portal/types';
import { ItemPrice } from './item-price';

type FeaturedLicenseItemCardProps = {
	item: APIProductFamilyProduct;
	bundleSize?: number;
	ctaAsPrimary?: boolean;
	isCondensedVersion?: boolean;
	isCtaDisabled?: boolean;
	isCtaExternal?: boolean;
	onClickCta?: VoidFunction;
};

export const FeaturedLicenseItemCard = ( {
	item,
	bundleSize,
	ctaAsPrimary,
	isCtaDisabled,
	isCtaExternal,
	onClickCta,
}: FeaturedLicenseItemCardProps ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const isLoggedIn = useSelector( isUserLoggedIn );
	const isAgency = useSelector( isAgencyUser );
	const { setParams, resetParams, getParamValue } = useURLQueryParams();
	const modalParamValue = getParamValue( LICENSE_INFO_MODAL_ID );
	const productSlug = item.slug;
	const [ showLightbox, setShowLightbox ] = useState( modalParamValue === productSlug );
	const title = getProductShortTitle( item, false );
	const ctaLabel = translate( 'Get' );
	const ctaAriaLabel = ctaLabel + ' ' + item.name;

	const price = <ItemPrice bundleSize={ bundleSize } item={ item } />;
	const { description: productDescription } = useProductDescription( productSlug );
	const hero = <HeroImageAPIFamily item={ item } />;

	const onShowLightbox = useCallback(
		( e: React.MouseEvent< HTMLElement > ) => {
			e.stopPropagation();
			setParams( [
				{
					key: LICENSE_INFO_MODAL_ID,
					value: productSlug,
				},
			] );
			setShowLightbox( true );
			dispatch(
				recordTracksEvent( 'calypso_jetpack_manage_more_about_product_view', {
					product: productSlug,
				} )
			);
		},
		[ dispatch, productSlug, setParams ]
	);

	const getIssueLicenseURL = useCallback(
		( productSlug: string, bundleSize: number | undefined ) => {
			if ( isLoggedIn && ! isAgency ) {
				return addQueryArgs( `/manage/signup/`, {
					product_slug: productSlug,
					source: 'manage-pricing-page',
					bundle_size: bundleSize,
				} );
			}
			return addQueryArgs( `/partner-portal/issue-license/`, {
				product_slug: productSlug,
				source: 'manage-pricing-page',
				bundle_size: bundleSize,
			} );
		},
		[ isLoggedIn, isAgency ]
	);

	const onSelectProduct = useCallback( () => {
		page( getIssueLicenseURL( productSlug, bundleSize ) );
	}, [ bundleSize, getIssueLicenseURL, productSlug ] );

	const onHideLightbox = useCallback( () => {
		resetParams( [ LICENSE_INFO_MODAL_ID ] );
		setShowLightbox( false );
	}, [ resetParams ] );

	const moreInfoLink = <LicenseLightboxLink productName={ title } onClick={ onShowLightbox } />;

	return (
		<>
			<div className="featured-item-card">
				<div className="featured-item-card--hero">{ hero }</div>

				<div className="featured-item-card--body">
					<div>
						<h3 className="featured-item-card--title">{ title }</h3>
						<div className="featured-item-card--price">{ price }</div>
						<div className="featured-item-card--desc">{ productDescription }</div>
						{ moreInfoLink }
					</div>
					<div className="featured-item-card--footer">
						<Button
							className="featured-item-card--cta"
							primary={ ctaAsPrimary }
							onClick={ onClickCta }
							disabled={ isCtaDisabled }
							target={ isCtaExternal ? '_blank' : undefined }
							href={ isCtaDisabled ? '#' : getIssueLicenseURL( productSlug, bundleSize ) }
							aria-label={ ctaAriaLabel }
						>
							{ ctaLabel }
						</Button>
					</div>
				</div>
			</div>
			{ showLightbox && (
				<LicenseLightbox
					product={ item }
					quantity={ bundleSize }
					ctaLabel={ translate( 'Select license' ) }
					isCTAPrimary={ true }
					isCTAExternalLink={ false }
					isDisabled={ false }
					onActivate={ onSelectProduct }
					onClose={ onHideLightbox }
				/>
			) }
		</>
	);
};
