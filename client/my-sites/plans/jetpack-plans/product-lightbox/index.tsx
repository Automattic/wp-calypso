import { Button } from '@automattic/components';
import { useMobileBreakpoint } from '@automattic/viewport-react';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useMemo, useState } from 'react';
import Modal from 'react-modal';
import FoldableCard from 'calypso/components/foldable-card';
import MultipleChoiceQuestion from 'calypso/components/multiple-choice-question';
import { useStoreItemInfoContext } from '../product-store/context/store-item-info-context';
import { ProductStoreBaseProps } from '../product-store/types';
import slugToSelectorProduct from '../slug-to-selector-product';
import { Duration, SelectorProduct } from '../types';
import { JETPACK_RELATED_PRODUCTS_MAP, PRODUCT_OPTIONS } from './constants';
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

const Includes = () => (
	<ul>
		<li>Real-time backups as you edit</li>
		<li>10GB of cloud storage</li>
		<li>30-day activity log archive</li>
		<li>Unlimited one-click restores from the last 30 days</li>
		<li>WooCommerce order and table backups</li>
		<li>Redundant cloud backups on our global network</li>
		<li>Priority support</li>
	</ul>
);

const Benefits = () => (
	<ul>
		<li>Restore your site in one click from desktop or mobile</li>
		<li>Restore offline sites</li>
		<li>No developer required</li>
		<li>Protect Woo order and customer data</li>
		<li>Best-in-class support from WordPress experts</li>
	</ul>
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
			answerText: PRODUCT_OPTIONS[ itemSlug ],
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
						{ Icons.backup }
						<h2>{ product.displayName }</h2>
					</div>
					<div className="product-lightbox__detail-desc">
						Protect your site or store. Save every change with real-time cloud backups, and restore
						in one click from anywhere.
					</div>
					<div className="product-lightbox__detail-tags">
						<span className="product-lightbox__detail-tags-label">Great for:</span>
						<div className="product-lightbox__detail-tags-tag">
							<span>{ Tags.woo.icon }</span>
							<p>WooCommerce stores</p>
						</div>
						<div className="product-lightbox__detail-tags-tag">
							<span>{ Tags.news.icon }</span>
							<p>{ Tags.news.label }</p>
						</div>
						<div className="product-lightbox__detail-tags-tag">
							<span>{ Tags.membership.icon }</span>
							<p>{ Tags.membership.label }</p>
						</div>
						<div className="product-lightbox__detail-tags-tag">
							<span>{ Tags.forum.icon }</span>
							<p>{ Tags.forum.label }</p>
						</div>
					</div>

					<div className="product-lightbox__detail-list">
						{ isMobile ? (
							<FoldableCard hideSummary header="Includes" expanded={ false }>
								<Includes />
							</FoldableCard>
						) : (
							<>
								<p>Includes</p>
								<Includes />
							</>
						) }
					</div>
					<hr />
					<div className="product-lightbox__detail-list">
						{ isMobile ? (
							<FoldableCard hideSummary header="Benefits" expanded={ false }>
								<Benefits />
							</FoldableCard>
						) : (
							<>
								<p>Benefits</p>
								<Benefits />
							</>
						) }
					</div>
				</div>
				<div className="product-lightbox__variants">
					<div className="product-lightbox__variants-content">
						{ shouldShowOptions && (
							<div className="product-lightbox__variants-options">
								<MultipleChoiceQuestion
									question={ `${ translate( 'Choose a storage option' ) }:` }
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
							{ 'Checkout' }
						</Button>
					</div>
				</div>
			</div>
		</Modal>
	);
};

export default ProductLightbox;
