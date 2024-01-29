import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Button } from '@automattic/components';
import { addQueryArgs } from '@wordpress/url';
import 'calypso/my-sites/plans/jetpack-plans/product-store/featured-item-card/style.scss';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useState } from 'react';
import { useSelector } from 'react-redux';
import MultipleChoiceQuestion from 'calypso/components/multiple-choice-question';
import { useProductDescription } from 'calypso/jetpack-cloud/sections/partner-portal/hooks';
import getProductShortTitle from 'calypso/jetpack-cloud/sections/partner-portal/lib/get-product-short-title';
import getProductVariantShortTitle from 'calypso/jetpack-cloud/sections/partner-portal/lib/get-product-variant-short-title';
import { HeroImageAPIFamily } from 'calypso/my-sites/plans/jetpack-plans/product-store/hero-image';
import { useDispatch } from 'calypso/state';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { isAgencyUser } from 'calypso/state/partner-portal/partner/selectors';
import { APIProductFamilyProduct } from 'calypso/state/partner-portal/types';
import { ItemPrice } from './item-price';
import './style.scss';

type FeaturedLicenseMultiItemCardProps = {
	variants: APIProductFamilyProduct[];
	bundleSize?: number;
	ctaAsPrimary?: boolean;
	moreInfoLink?: React.ReactNode;
	isCondensedVersion?: boolean;
	isCtaDisabled?: boolean;
	isCtaExternal?: boolean;
	onClickCta?: VoidFunction;
};

export const FeaturedLicenseMultiItemCard = ( {
	variants,
	bundleSize,
	ctaAsPrimary,
	moreInfoLink,
	isCtaDisabled,
	isCtaExternal,
	onClickCta,
}: FeaturedLicenseMultiItemCardProps ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const [ variant, setVariant ] = useState( variants[ 0 ] );

	const title = getProductShortTitle( variant, true );
	const isLoggedIn = useSelector( isUserLoggedIn );
	const isAgency = useSelector( isAgencyUser );
	const ctaLabel = translate( 'Get' );
	const ctaAriaLabel = ctaLabel + ' ' + variant.name;

	const getIssueLicenseURL = useCallback(
		( variant: APIProductFamilyProduct, bundleSize: number | undefined ) => {
			if ( isLoggedIn ) {
				if ( isAgency ) {
					return addQueryArgs( `/partner-portal/issue-license/`, {
						product_slug: variant.slug,
						source: 'manage-pricing-page',
						bundle_size: bundleSize,
					} );
				}
				return addQueryArgs( `/manage/signup/`, {
					product_slug: variant.slug,
					source: 'manage-pricing-page',
					bundle_size: bundleSize,
				} );
			}
			return '#';
		},
		[ isLoggedIn, isAgency ]
	);

	const price = <ItemPrice bundleSize={ bundleSize } item={ variant } />;
	const { description: productDescription } = useProductDescription( variant.slug );
	const hero = <HeroImageAPIFamily item={ variant } />;

	const onChangeOption = useCallback(
		( selectedProductSlug: string ) => {
			const selectedProduct =
				variants.find( ( { slug } ) => slug === selectedProductSlug ) ?? variants[ 0 ];

			setVariant( selectedProduct );
			dispatch(
				recordTracksEvent( 'calypso_jp_manage_pricing_page_variant_option_click', {
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

	return (
		<div className="featured-item-card">
			<div className="featured-item-card--hero">{ hero }</div>

			<div className="featured-item-card--body">
				<div>
					<h3 className="featured-item-card--title">{ title }</h3>
					<MultipleChoiceQuestion
						name={ `${ variant.family_slug }-variant-options` }
						question={ translate( 'Select variant:' ) }
						answers={ variantOptions }
						selectedAnswerId={ variant.slug }
						onAnswerChange={ onChangeOption }
						shouldShuffleAnswers={ false }
					/>
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
						href={ isCtaDisabled ? '#' : getIssueLicenseURL( variant, bundleSize ) }
						aria-label={ ctaAriaLabel }
					>
						{ ctaLabel }
					</Button>
				</div>
			</div>
		</div>
	);
};
