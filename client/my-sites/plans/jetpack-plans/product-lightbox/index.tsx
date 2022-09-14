import { JetpackTag, JETPACK_RELATED_PRODUCTS_MAP } from '@automattic/calypso-products';
import { Button } from '@automattic/components';
import { useMobileBreakpoint } from '@automattic/viewport-react';
import { TranslateResult, useTranslate } from 'i18n-calypso';
import { useCallback, useMemo } from 'react';
import Modal from 'react-modal';
import FoldableCard from 'calypso/components/foldable-card';
import MultipleChoiceQuestion from 'calypso/components/multiple-choice-question';
import { useStoreItemInfoContext } from '../product-store/context/store-item-info-context';
import { ProductStoreBaseProps } from '../product-store/types';
import getProductIcon from '../product-store/utils/get-product-icon';
import slugToSelectorProduct from '../slug-to-selector-product';
import { Duration, SelectorProduct } from '../types';
import { PRODUCT_OPTIONS, PRODUCT_OPTIONS_HEADER } from './constants';
import { Icons } from './icons/icons';
import { Tags } from './icons/tags';
import PaymentPlan from './payment-plan';
import './style.scss';

type Props = ProductStoreBaseProps & {
	product: SelectorProduct;
	isVisible: boolean;
	duration: Duration;
	onClose: () => void;
	onChangeProduct: ( product: SelectorProduct | null ) => void;
	siteId: number | null;
};

const DescriptionList: React.FC< { items?: TranslateResult[] } > = ( { items } ) => {
	if ( ! items || ! items.length ) {
		return null;
	}

	return (
		<ul>
			{ items.map( ( item, index ) => (
				<li key={ index }>{ item }</li>
			) ) }
		</ul>
	);
};

const TagItems: React.FC< { tags: JetpackTag[] } > = ( { tags } ) => (
	<>
		{ tags.map( ( tag ) => (
			<div className="product-lightbox__detail-tags-tag" key={ tag.tag }>
				<span>{ Tags[ tag.tag ] }</span>
				<p>{ tag.label }</p>
			</div>
		) ) }
	</>
);

const ProductLightbox: React.FC< Props > = ( {
	product,
	isVisible,
	onClose,
	onChangeProduct,
	siteId,
} ) => {
	const close = useCallback( () => onClose?.(), [ onClose ] );
	const translate = useTranslate();

	const onChangeOption = useCallback(
		( productSlug: string ) => onChangeProduct( slugToSelectorProduct( productSlug ) ),
		[ onChangeProduct ]
	);

	const { getCheckoutURL, getIsMultisiteCompatible, isMultisite } = useStoreItemInfoContext();
	const isMobile = useMobileBreakpoint();

	const variantOptions = useMemo( () => {
		const variants = JETPACK_RELATED_PRODUCTS_MAP[ product.productSlug ] || [];
		return variants.map( ( itemSlug ) => ( {
			id: itemSlug,
			answerText: PRODUCT_OPTIONS[ itemSlug ].toString(),
		} ) );
	}, [ product.productSlug ] );

	const shouldShowOptions = variantOptions.length > 1;

	const isMultiSiteIncompatible = isMultisite && ! getIsMultisiteCompatible( product );

	return (
		<Modal
			className="product-lightbox__modal"
			overlayClassName="product-lightbox__modal-overlay"
			isOpen={ isVisible }
			onRequestClose={ close }
			htmlOpenClassName="ReactModal__Html--open"
		>
			<div className="product-lightbox__content-wrapper">
				<Button className="product-lightbox__close-button" plain onClick={ close }>
					{ Icons.close }
				</Button>
				<div className="product-lightbox__detail">
					<div className="product-lightbox__detail-header">
						<div className="product-lightbox__product-icon">
							<img alt="" src={ getProductIcon( { productSlug: product.productSlug } ) } />
						</div>
						<h2>{ product.displayName }</h2>
					</div>
					<div className="product-lightbox__detail-desc">{ product.lightboxDescription }</div>
					<div className="product-lightbox__detail-tags">
						<span className="product-lightbox__detail-tags-label">
							{ translate( 'Great for:' ) }
						</span>
						{ product.recommendedFor && <TagItems tags={ product.recommendedFor } /> }
					</div>

					<div className="product-lightbox__detail-list">
						{ isMobile ? (
							<FoldableCard hideSummary header={ translate( 'Includes' ) } expanded={ false }>
								<DescriptionList items={ product.whatIsIncluded } />
							</FoldableCard>
						) : (
							<>
								<p>{ translate( 'Includes' ) }</p>
								<DescriptionList items={ product.whatIsIncluded } />
							</>
						) }
					</div>
					<hr />
					<div className="product-lightbox__detail-list">
						{ isMobile ? (
							<FoldableCard hideSummary header={ translate( 'Benefits' ) } expanded={ false }>
								<DescriptionList items={ product.benefits } />
							</FoldableCard>
						) : (
							<>
								<p>{ translate( 'Benefits' ) }</p>
								<DescriptionList items={ product.benefits } />
							</>
						) }
					</div>
				</div>
				<div className="product-lightbox__variants">
					<div className="product-lightbox__variants-content">
						{ shouldShowOptions && (
							<div className="product-lightbox__variants-options">
								<MultipleChoiceQuestion
									question={ PRODUCT_OPTIONS_HEADER[ product?.productSlug ] }
									answers={ variantOptions }
									selectedAnswerId={ product?.productSlug }
									onAnswerChange={ onChangeOption }
									shouldShuffleAnswers={ false }
								/>
							</div>
						) }
						<PaymentPlan
							isMultiSiteIncompatible={ isMultiSiteIncompatible }
							siteId={ siteId }
							product={ product }
						/>
						<Button
							primary
							className="jetpack-product-card__button product-lightbox__checkout-button"
							href={ isMultiSiteIncompatible ? '#' : getCheckoutURL( product ) }
							disabled={ isMultiSiteIncompatible }
						>
							{ translate( 'Checkout' ) }
						</Button>
					</div>
				</div>
			</div>
		</Modal>
	);
};

export default ProductLightbox;
