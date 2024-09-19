import page from '@automattic/calypso-router';
import { addQueryArgs } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useState } from 'react';
import { useSelector } from 'react-redux';
import MultipleChoiceQuestion from 'calypso/components/multiple-choice-question';
import { useProductDescription } from 'calypso/jetpack-cloud/sections/partner-portal/hooks';
import { useURLQueryParams } from 'calypso/jetpack-cloud/sections/partner-portal/hooks/index';
import { LICENSE_INFO_MODAL_ID } from 'calypso/jetpack-cloud/sections/partner-portal/lib';
import getProductShortTitle from 'calypso/jetpack-cloud/sections/partner-portal/lib/get-product-short-title';
import getProductVariantShortTitle from 'calypso/jetpack-cloud/sections/partner-portal/lib/get-product-variant-short-title';
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

import './style.scss';
import 'calypso/my-sites/plans/jetpack-plans/product-store/featured-item-card/style.scss';

type FeaturedLicenseMultiItemCardProps = {
	variants: APIProductFamilyProduct[];
	bundleSize?: number;
	ctaAsPrimary?: boolean;
	isCondensedVersion?: boolean;
	isCtaDisabled?: boolean;
	isCtaExternal?: boolean;
};

export const FeaturedLicenseMultiItemCard = ( {
	variants,
	bundleSize,
	ctaAsPrimary,
	isCtaDisabled,
	isCtaExternal,
}: FeaturedLicenseMultiItemCardProps ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const isLoggedIn = useSelector( isUserLoggedIn );
	const isAgency = useSelector( isAgencyUser );
	const [ variant, setVariant ] = useState( variants[ 0 ] );
	const { setParams, resetParams, getParamValue } = useURLQueryParams();
	const modalParamValue = getParamValue( LICENSE_INFO_MODAL_ID );
	const variantSlug = variant.slug;

	const [ showLightbox, setShowLightbox ] = useState( modalParamValue === variantSlug );

	const title = getProductShortTitle( variant, true );
	const ctaLabel = translate( 'Get' );
	const ctaAriaLabel = ctaLabel + ' ' + variant.name;

	const price = <ItemPrice bundleSize={ bundleSize } item={ variant } />;
	const { description: productDescription } = useProductDescription( variantSlug );
	const hero = <HeroImageAPIFamily item={ variant } />;

	const onChangeOption = useCallback(
		( selectedProductSlug: string ) => {
			const selectedProduct =
				variants.find( ( { slug } ) => slug === selectedProductSlug ) ?? variants[ 0 ];

			setVariant( selectedProduct );
			dispatch(
				recordTracksEvent( 'calypso_jetpack_manage_pricing_page_variant_option_click', {
					product: selectedProductSlug,
				} )
			);
		},
		[ dispatch, variants ]
	);

	const variantOptions = variants.map( ( option ) => ( {
		id: option.slug,
		answerText: getProductVariantShortTitle( option.name ),
	} ) );

	const onShowLightbox = useCallback(
		( e: React.MouseEvent< HTMLElement > ) => {
			e.stopPropagation();

			setParams( [
				{
					key: LICENSE_INFO_MODAL_ID,
					value: variantSlug,
				},
			] );
			setShowLightbox( true );
			dispatch(
				recordTracksEvent( 'calypso_jetpack_manage_more_about_product_view', {
					product: variantSlug,
				} )
			);
		},
		[ dispatch, variantSlug, setParams ]
	);

	const getIssueLicenseURL = useCallback(
		( variantSlug: string, bundleSize: number | undefined ) => {
			if ( isLoggedIn && ! isAgency ) {
				return addQueryArgs( `/manage/signup/`, {
					products: `${ variantSlug }:${ bundleSize }`,
					source: 'manage-pricing-page',
					bundle_size: bundleSize,
				} );
			}
			return addQueryArgs( `/partner-portal/issue-license/`, {
				products: `${ variantSlug }:${ bundleSize }`,
				source: 'manage-pricing-page',
				bundle_size: bundleSize,
			} );
		},
		[ isLoggedIn, isAgency ]
	);

	const onSelectProduct = useCallback( () => {
		page.replace( getIssueLicenseURL( variantSlug, bundleSize ) );
		dispatch(
			recordTracksEvent( 'calypso_jetpack_manage_on_select_product_button_click', {
				product: variantSlug,
				bundle_size: bundleSize,
			} )
		);
	}, [ bundleSize, dispatch, getIssueLicenseURL, variantSlug ] );

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
				variant={
					<MultipleChoiceQuestion
						name={ `${ variant.family_slug }-variant-options` }
						question={ translate( 'Select variant:' ) }
						answers={ variantOptions }
						selectedAnswerId={ variant.slug }
						onAnswerChange={ onChangeOption }
						shouldShuffleAnswers={ false }
					/>
				}
			/>
			{ showLightbox && (
				<LicenseLightbox
					product={ variant }
					quantity={ bundleSize }
					ctaLabel={ translate( 'Select license' ) }
					isCTAExternalLink={ false }
					isCTAPrimary
					isDisabled={ false }
					onActivate={ onSelectProduct }
					onClose={ onHideLightbox }
				/>
			) }
		</>
	);
};
