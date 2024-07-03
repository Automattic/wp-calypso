import page from '@automattic/calypso-router';
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
import { FeaturedItemCard } from 'calypso/my-sites/plans/jetpack-plans/product-store/featured-item-card';
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
};

export const FeaturedLicenseItemCard = ( {
	item,
	bundleSize,
	ctaAsPrimary,
	isCtaDisabled,
	isCtaExternal,
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
					products: `${ productSlug }:${ bundleSize }`,
					source: 'manage-pricing-page',
					bundle_size: bundleSize,
				} );
			}
			return addQueryArgs( `/partner-portal/issue-license/`, {
				products: `${ productSlug }:${ bundleSize }`,
				source: 'manage-pricing-page',
				bundle_size: bundleSize,
			} );
		},
		[ isLoggedIn, isAgency ]
	);

	const onSelectProduct = useCallback( () => {
		page.replace( getIssueLicenseURL( productSlug, bundleSize ) );
		dispatch(
			recordTracksEvent( 'calypso_jetpack_manage_on_select_product_button_click', {
				product: productSlug,
				bundle_size: bundleSize,
			} )
		);
	}, [ bundleSize, dispatch, getIssueLicenseURL, productSlug ] );

	const onHideLightbox = useCallback( () => {
		resetParams( [ LICENSE_INFO_MODAL_ID ] );
		setShowLightbox( false );
	}, [ resetParams ] );

	const moreInfoLink = <LicenseLightboxLink productName={ title } onClick={ onShowLightbox } />;

	return (
		<>
			<FeaturedItemCard
				hero={ hero }
				title={ title }
				description={
					<>
						{ productDescription }
						{ moreInfoLink }
					</>
				}
				price={ price }
				ctaAsPrimary={ ctaAsPrimary }
				onClickCta={ onSelectProduct }
				isCtaDisabled={ isCtaDisabled }
				isCtaExternal={ isCtaExternal }
				ctaAriaLabel={ ctaAriaLabel }
				ctaLabel={ ctaLabel }
			/>
			{ showLightbox && (
				<LicenseLightbox
					product={ item }
					quantity={ bundleSize }
					ctaLabel={ translate( 'Select license' ) }
					isCTAPrimary
					isCTAExternalLink={ false }
					isDisabled={ false }
					onActivate={ onSelectProduct }
					onClose={ onHideLightbox }
				/>
			) }
		</>
	);
};
