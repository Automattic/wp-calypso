import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Button } from '@automattic/components';
import 'calypso/my-sites/plans/jetpack-plans/product-store/featured-item-card/style.scss';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useState } from 'react';
import MultipleChoiceQuestion from 'calypso/components/multiple-choice-question';
import { useProductDescription } from 'calypso/jetpack-cloud/sections/partner-portal/hooks';
import getProductShortTitle from 'calypso/jetpack-cloud/sections/partner-portal/lib/get-product-short-title';
import getProductVariantShortTitle from 'calypso/jetpack-cloud/sections/partner-portal/lib/get-product-variant-short-title';
import { HeroImage } from 'calypso/my-sites/plans/jetpack-plans/product-store/hero-image';
import { useDispatch } from 'calypso/state';
import { APIProductFamilyProduct } from 'calypso/state/partner-portal/types';
import { ItemPrice } from './item-price';
import './style.scss';

type FeaturedLicenseMultiItemCardProps = {
	items: APIProductFamilyProduct[];
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

export const FeaturedLicenseMultiItemCard = ( {
	items,
	bundleSize,
	priceDiscount,
	ctaAsPrimary,
	ctaHref,
	moreInfoLink,
	isCtaDisabled,
	isCtaExternal,
	onClickCta,
}: FeaturedLicenseMultiItemCardProps ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const [ item, setItem ] = useState( items[ 0 ] );

	const title = getProductShortTitle( item, false );
	const ctaLabel = translate( 'Get' );
	const ctaAriaLabel = ctaLabel + ' ' + item.name;

	const price = <ItemPrice bundleSize={ bundleSize } item={ item } siteId={ null } />;
	const { description: productDescription } = useProductDescription( item.slug );
	const hero = <HeroImage item={ item } />;

	const onChangeOption = useCallback(
		( selectedProductSlug: string ) => {
			const selectedProduct =
				items.find( ( { slug } ) => slug === selectedProductSlug ) ?? items[ 0 ];

			setItem( selectedProduct );
			dispatch(
				recordTracksEvent( 'calypso_jp_manage_pricing_page_variant_option_click', {
					product: item.slug,
				} )
			);
		},
		[ dispatch, item.slug, items ]
	);

	const variantOptions = items.map( ( option ) => ( {
		id: option.slug,
		answerText: getProductVariantShortTitle( option.name ),
	} ) );

	return (
		<div className="featured-item-card">
			<div className="featured-item-card--hero">{ hero }</div>

			<div className="featured-item-card--body">
				<div>
					<h3 className="featured-item-card--title">
						{ title }
						{ priceDiscount ? priceDiscount : '' }
					</h3>
					<MultipleChoiceQuestion
						name="product-variants"
						question={ translate( 'Select variant:' ) }
						answers={ variantOptions }
						selectedAnswerId={ item?.slug }
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
