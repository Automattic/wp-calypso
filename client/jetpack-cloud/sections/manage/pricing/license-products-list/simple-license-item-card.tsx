import page from '@automattic/calypso-router';
import { Icon, plugins } from '@wordpress/icons';
import { addQueryArgs } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useState } from 'react';
import { useSelector } from 'react-redux';
import 'calypso/my-sites/plans/jetpack-plans/product-store/featured-item-card/style.scss';
import getAPIFamilyProductIcon from 'calypso/jetpack-cloud/sections/manage/pricing/utils/get-api-family-product-icon';
import { useProductDescription } from 'calypso/jetpack-cloud/sections/partner-portal/hooks';
import { useURLQueryParams } from 'calypso/jetpack-cloud/sections/partner-portal/hooks/index';
import { LICENSE_INFO_MODAL_ID } from 'calypso/jetpack-cloud/sections/partner-portal/lib';
import getProductShortTitle from 'calypso/jetpack-cloud/sections/partner-portal/lib/get-product-short-title';
import LicenseLightbox from 'calypso/jetpack-cloud/sections/partner-portal/license-lightbox/index';
import LicenseLightboxLink from 'calypso/jetpack-cloud/sections/partner-portal/license-lightbox-link/index';
import { SimpleItemCard } from 'calypso/my-sites/plans/jetpack-plans/product-store/simple-item-card';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { isAgencyUser } from 'calypso/state/partner-portal/partner/selectors';
import { APIProductFamilyProduct } from 'calypso/state/partner-portal/types';
import { ItemPrice } from './item-price';

type SimpleLicenseItemCardProps = {
	item: APIProductFamilyProduct;
	bundleSize?: number;
	ctaAsPrimary?: boolean;
	isCondensedVersion?: boolean;
	isCtaDisabled?: boolean;
	isCtaExternal?: boolean;
	onClickCta?: VoidFunction;
};

export const SimpleLicenseItemCard = ( {
	item,
	bundleSize,
	ctaAsPrimary,
	isCtaDisabled,
	isCtaExternal,
	onClickCta,
}: SimpleLicenseItemCardProps ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const isLoggedIn = useSelector( isUserLoggedIn );
	const isAgency = useSelector( isAgencyUser );
	const { setParams, resetParams, getParamValue } = useURLQueryParams();
	const modalParamValue = getParamValue( LICENSE_INFO_MODAL_ID );
	const [ showLightbox, setShowLightbox ] = useState( modalParamValue === item.slug );
	const title = getProductShortTitle( item, false );

	const ctaLabel = translate( 'Get' );
	const ctaAriaLabel = ctaLabel + ' ' + item.name;
	const productSlug = item.slug;

	let price = <ItemPrice bundleSize={ bundleSize } item={ item } />;
	if (
		item.name.startsWith( 'Jetpack VaultPress Backup Add-on' ) ||
		item.name.startsWith( 'WooCommerce' )
	) {
		price = <ItemPrice bundleSize={ 1 } item={ item } />;
	}
	const { description: productDescription } = useProductDescription( productSlug );

	let icon = null;

	if ( productSlug.startsWith( 'woocommerce' ) ) {
		icon = (
			<Icon
				className="woocommerce-extension-plugin-icon"
				icon={ plugins }
				width={ 24 }
				height={ 24 }
			/>
		);
	} else if ( productSlug.startsWith( 'jetpack-backup' ) ) {
		icon = (
			<img
				alt={ item.name + ' icon' }
				src={ getAPIFamilyProductIcon( { productSlug: 'jetpack-backup' } ) }
			/>
		);
	} else {
		icon = (
			<img
				alt={ item.name + ' icon' }
				src={ getAPIFamilyProductIcon( { productSlug: item.slug } ) }
			/>
		);
	}

	const onShowLightbox = useCallback(
		( e: React.MouseEvent< HTMLElement > ) => {
			e.stopPropagation();
			setParams( [
				{
					key: LICENSE_INFO_MODAL_ID,
					value: item.slug,
				},
			] );
			setShowLightbox( true );
			dispatch(
				recordTracksEvent( 'calypso_jetpack_manage_more_about_product_view', {
					product: item.slug,
				} )
			);
		},
		[ dispatch, item.slug, setParams ]
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
		page( getIssueLicenseURL( productSlug, bundleSize ) );
	}, [ bundleSize, getIssueLicenseURL, productSlug ] );

	const onHideLightbox = useCallback( () => {
		resetParams( [ LICENSE_INFO_MODAL_ID ] );
		setShowLightbox( false );
	}, [ resetParams ] );

	const moreInfoLink = ! productSlug.startsWith( 'jetpack-backup' ) ? (
		<LicenseLightboxLink productName={ title } onClick={ onShowLightbox } />
	) : null;

	return (
		<>
			<SimpleItemCard
				isCondensedVersion={ false }
				title={ title }
				icon={ icon }
				description={
					<>
						{ productDescription }
						{ moreInfoLink }
					</>
				}
				price={ price }
				moreInfoLink={ moreInfoLink }
				ctaAsPrimary={ ctaAsPrimary }
				onClickCta={ onClickCta }
				isCtaDisabled={ isCtaDisabled }
				isCtaExternal={ isCtaExternal }
				ctaHref={ isCtaDisabled ? '#' : getIssueLicenseURL( productSlug, bundleSize ) }
				ctaAriaLabel={ ctaAriaLabel }
				ctaLabel={ ctaLabel }
			/>
			{ showLightbox && (
				<LicenseLightbox
					product={ item }
					quantity={ bundleSize }
					ctaLabel={ translate( 'Select license' ) }
					isCTAExternalLink={ false }
					isCTAPrimary={ true }
					isDisabled={ false }
					onActivate={ onSelectProduct }
					onClose={ onHideLightbox }
				/>
			) }
		</>
	);
};
