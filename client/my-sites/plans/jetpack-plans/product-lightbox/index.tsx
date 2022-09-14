import { JetpackTag, JETPACK_RELATED_PRODUCTS_MAP } from '@automattic/calypso-products';
import { Button } from '@automattic/components';
import { useMobileBreakpoint } from '@automattic/viewport-react';
import { TranslateResult, useTranslate } from 'i18n-calypso';
import { useCallback, useMemo, useState } from 'react';
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
	siteId: number | null;
};

const DescriptionList: React.FC< { items?: TranslateResult[] } > = ( { items } ) => {
	if ( ! items || ! items.length ) {
		return null;
	}

	return (
		<ul>
			{ items.map( ( item ) => (
				<li key={ item.toString() }>{ item }</li>
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

const ProductLightbox: React.FC< Props > = ( { product, isVisible, onClose, siteId } ) => {
	const close = useCallback( () => onClose?.(), [ onClose ] );
	const translate = useTranslate();

	const [ currentProduct, setCurrentProduct ] = useState< SelectorProduct >( product );

	const onChangeOption = useCallback(
		( productSlug: string ) => {
			setCurrentProduct( slugToSelectorProduct( productSlug ) || product );
		},
		[ product ]
	);
	const { getCheckoutURL, getIsMultisiteCompatible, isMultisite } = useStoreItemInfoContext();
	const isMobile = useMobileBreakpoint();

	const variantOptions = useMemo( () => {
		const variants = JETPACK_RELATED_PRODUCTS_MAP[ currentProduct.productSlug ] || [];
		return variants.map( ( itemSlug ) => ( {
			id: itemSlug,
			answerText: PRODUCT_OPTIONS[ itemSlug ].toString(),
		} ) );
	}, [ currentProduct.productSlug ] );

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
						<h2>{ currentProduct.displayName }</h2>
					</div>
					<div className="product-lightbox__detail-desc">{ product.featuredDescription }</div>
					<div className="product-lightbox__detail-tags">
						<span className="product-lightbox__detail-tags-label">
							{ translate( 'Great for:' ) }
						</span>
						{ currentProduct.recommendedFor && <TagItems tags={ currentProduct.recommendedFor } /> }
					</div>

					<div className="product-lightbox__detail-list">
						{ isMobile ? (
							<FoldableCard hideSummary header={ translate( 'Includes' ) } expanded={ false }>
								<DescriptionList items={ currentProduct.whatIsIncluded } />
							</FoldableCard>
						) : (
							<>
								<p>{ translate( 'Includes' ) }</p>
								<DescriptionList items={ currentProduct.whatIsIncluded } />
							</>
						) }
					</div>
					<hr />
					<div className="product-lightbox__detail-list">
						{ isMobile ? (
							<FoldableCard hideSummary header={ translate( 'Benefits' ) } expanded={ false }>
								<DescriptionList items={ currentProduct.benefits } />
							</FoldableCard>
						) : (
							<>
								<p>{ translate( 'Benefits' ) }</p>
								<DescriptionList items={ currentProduct.benefits } />
							</>
						) }
					</div>
				</div>
				<div className="product-lightbox__variants">
					<div className="product-lightbox__variants-content">
						{ shouldShowOptions && (
							<div className="product-lightbox__variants-options">
								<MultipleChoiceQuestion
									question={ PRODUCT_OPTIONS_HEADER[ currentProduct?.productSlug ] }
									answers={ variantOptions }
									selectedAnswerId={ currentProduct?.productSlug }
									onAnswerChange={ onChangeOption }
									shouldShuffleAnswers={ false }
								/>
							</div>
						) }
						<PaymentPlan
							isMultiSiteIncompatible={ isMultiSiteIncompatible }
							siteId={ siteId }
							product={ currentProduct }
						/>
						<Button
							primary
							className="jetpack-product-card__button product-lightbox__checkout-button"
							href={ isMultiSiteIncompatible ? '#' : getCheckoutURL( currentProduct ) }
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
