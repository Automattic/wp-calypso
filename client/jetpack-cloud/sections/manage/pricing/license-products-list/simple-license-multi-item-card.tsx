import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Button } from '@automattic/components';
import { Icon, cloud } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useState } from 'react';
import MultipleChoiceQuestion from 'calypso/components/multiple-choice-question';
import { useProductDescription } from 'calypso/jetpack-cloud/sections/partner-portal/hooks';
import getProductShortTitle from 'calypso/jetpack-cloud/sections/partner-portal/lib/get-product-short-title';
import getProductVariantShortTitle from 'calypso/jetpack-cloud/sections/partner-portal/lib/get-product-variant-short-title';
import { useDispatch } from 'calypso/state';
import { APIProductFamilyProduct } from 'calypso/state/partner-portal/types';
import { ItemPrice } from './item-price';
import 'calypso/my-sites/plans/jetpack-plans/product-store/simple-item-card/style.scss';
import './style.scss';

type SimpleLicenseMultiItemCardProps = {
	variants: APIProductFamilyProduct[];
	bundleSize?: number;
	ctaAsPrimary?: boolean;
	ctaHref?: string;
	moreInfoLink?: React.ReactNode;
	isCondensedVersion?: boolean;
	isCtaDisabled?: boolean;
	isCtaExternal?: boolean;
	onClickCta?: VoidFunction;
};

export const SimpleLicenseMultiItemCard = ( {
	variants,
	bundleSize,
	ctaAsPrimary,
	ctaHref,
	moreInfoLink,
	isCtaDisabled,
	isCtaExternal,
	onClickCta,
}: SimpleLicenseMultiItemCardProps ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const [ variant, setVariant ] = useState( variants[ 0 ] );

	const title = getProductShortTitle( variant, true );
	const ctaLabel = translate( 'Get' );
	const ctaAriaLabel = ctaLabel + ' ' + variant.name;
	const variantSlug = variant.slug;

	const price = <ItemPrice bundleSize={ bundleSize } item={ variant } />;
	const { description: productDescription } = useProductDescription( variantSlug );

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

	let icon = null;

	if ( variantSlug.startsWith( 'jetpack-backup' ) ) {
		icon = (
			<Icon className="jetpack-backup-plugin-icon" icon={ cloud } width={ 28 } height={ 28 } />
		);
	}

	return (
		<div className="simple-item-card">
			{ icon ? <div className="simple-item-card__icon">{ icon }</div> : null }
			<div className="simple-item-card__body">
				<div className="simple-item-card__header">
					<div>
						<h3 className="simple-item-card__title">{ title }</h3>
						<div className="simple-item-card__price">{ price }</div>
					</div>
					<Button
						className="simple-item-card__cta"
						onClick={ onClickCta }
						disabled={ isCtaDisabled }
						href={ isCtaDisabled ? '#' : ctaHref }
						target={ isCtaExternal ? '_blank' : undefined }
						primary={ ctaAsPrimary }
						aria-label={ ctaAriaLabel }
					>
						{ ctaLabel }
					</Button>
				</div>
				<MultipleChoiceQuestion
					name={ `${ variant.family_slug }-variant-options` }
					question={ translate( 'Select variant:' ) }
					answers={ variantOptions }
					selectedAnswerId={ variant.slug }
					onAnswerChange={ onChangeOption }
					shouldShuffleAnswers={ false }
				/>
				<div className="simple-item-card__footer">
					{ productDescription }
					{ moreInfoLink }
				</div>
			</div>
		</div>
	);
};
