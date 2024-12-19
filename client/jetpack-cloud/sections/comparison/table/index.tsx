import { TERM_ANNUALLY, PLAN_JETPACK_FREE } from '@automattic/calypso-products';
import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { Fragment, useCallback, useMemo } from 'react';
import { usePresalesChat } from 'calypso/lib/presales-chat';
import CalypsoShoppingCartProvider from 'calypso/my-sites/checkout/calypso-shopping-cart-provider';
import ProductLightbox from 'calypso/my-sites/plans/jetpack-plans/product-lightbox';
import StoreItemInfoContext, {
	useStoreItemInfoContext,
} from 'calypso/my-sites/plans/jetpack-plans/product-store/context/store-item-info-context';
import { useProductLightbox } from 'calypso/my-sites/plans/jetpack-plans/product-store/hooks/use-product-lightbox';
import { useStoreItemInfo } from 'calypso/my-sites/plans/jetpack-plans/product-store/hooks/use-store-item-info';
import { ItemPrice } from 'calypso/my-sites/plans/jetpack-plans/product-store/item-price';
import { MoreInfoLink } from 'calypso/my-sites/plans/jetpack-plans/product-store/more-info-link';
import slugToSelectorProduct from 'calypso/my-sites/plans/jetpack-plans/slug-to-selector-product';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions/record';
import { getPurchaseURLCallback } from '../../../../my-sites/plans/jetpack-plans/get-purchase-url-callback';
import { TableWithStoreContextProps } from '../types';
import { links } from './links';
import { useComparisonData } from './useComparisonData';
import { useProductsToCompare } from './useProductsToCompare';
import type { SelectorProduct, PurchaseCallback } from 'calypso/my-sites/plans/jetpack-plans/types';
import './style.scss';

export const Table: React.FC = () => {
	const translate = useTranslate();

	const productsToCompare = useProductsToCompare();

	const data = useComparisonData();

	const { currentProduct, setCurrentProduct, onClickMoreInfoFactory } = useProductLightbox();
	const { getCheckoutURL, getCtaLabel, getIsExternal, getOnClickPurchase } =
		useStoreItemInfoContext();

	usePresalesChat( 'jpGeneral' );

	const sectionHeadingColSpan = productsToCompare.length + 1;

	const headerRow = (
		<tr className="header-row">
			<th></th>
			{ productsToCompare.map( ( { id, name, productSlug } ) => {
				const isFree = 'FREE' === id;

				const item = (
					isFree ? { productSlug: PLAN_JETPACK_FREE } : slugToSelectorProduct( productSlug )
				) as SelectorProduct;

				return (
					<th key={ id } scope="col" className={ `product product-jetpack-${ id.toLowerCase() }` }>
						<div className="pricing-comparison__product-header">
							<span className="pricing-comparison__product-header--title">{ name }</span>

							<Button
								className="pricing-comparison__product-header--cta"
								primary={ ! isFree }
								onClick={ getOnClickPurchase( item ) }
								target={ ! isFree && getIsExternal( item ) ? '_blank' : undefined }
								href={ ! isFree ? getCheckoutURL( item ) : links.connect_free }
							>
								<span className="pricing-comparison__product-header--cta-desktop">
									{ isFree ? translate( 'Get started' ) : getCtaLabel( item, '' ) }
								</span>
								<span className="pricing-comparison__product-header--cta-mobile">
									{ isFree ? translate( 'Get started for free' ) : getCtaLabel( item, '' ) }
								</span>
							</Button>

							{ ! isFree && <ItemPrice item={ item } siteId={ null } /> }

							{ isFree ? (
								<span className="more-info-link">{ translate( 'Basic Jetpack features' ) }</span>
							) : (
								/* removing until the PR to add the lightbox for Growth is merged */
								<MoreInfoLink onClick={ onClickMoreInfoFactory( item ) } item={ item } />
							) }
						</div>
					</th>
				);
			} ) }
		</tr>
	);

	return (
		<section className="pricing-comparison">
			{ currentProduct && (
				<ProductLightbox
					siteId={ null }
					duration={ TERM_ANNUALLY }
					product={ currentProduct }
					isVisible={ !! currentProduct }
					onClose={ () => setCurrentProduct( null ) }
					onChangeProduct={ setCurrentProduct }
				/>
			) }
			<table className="pricing-comparison bundles">
				<colgroup>
					<col className="product-feature" />
					{ productsToCompare.map( ( { id } ) => (
						<col key={ id } className={ `product product-jetpack-${ id.toLowerCase() }` } />
					) ) }
				</colgroup>
				<thead>{ headerRow }</thead>

				<tbody>
					{ data.map( ( { sectionId, sectionName, icon, features } ) => {
						return (
							<Fragment key={ sectionId }>
								<tr>
									<th className="section-heading" colSpan={ sectionHeadingColSpan }>
										<div>
											<div className="section-heading__icon-container">
												<img className="section-heading--icon" alt="" src={ icon } />
											</div>
											<span>{ sectionName }</span>
										</div>
									</th>
								</tr>
								{ features.map( ( { id, name, icon, info, url } ) => {
									return (
										<tr key={ id }>
											<th scope="row" className="feature-heading">
												<div>
													{ icon ? (
														<div className="feature-heading__icon-container">
															<img alt="" src={ icon } />
														</div>
													) : (
														<div className="feature-heading__icon-placeholder" />
													) }
													<a href={ url }>{ name }</a>
												</div>
											</th>
											{ productsToCompare.map( ( { id, name: productName } ) => (
												<td
													key={ id }
													data-product={ productName }
													className={ info[ id ]?.highlight ? 'product-upgrade' : '' }
												>
													{ info[ id ]?.content }
												</td>
											) ) }
										</tr>
									);
								} ) }
							</Fragment>
						);
					} ) }
				</tbody>
				<tfoot>{ headerRow }</tfoot>
			</table>
			<p className="pricing-comparison__more-features">
				{ translate(
					'Looking for more? Check out {{link}}an exhaustive list of Jetpack features{{/link}}.',
					{
						components: {
							link: <a href={ links.features } />,
						},
					}
				) }
			</p>
		</section>
	);
};

const TableWithStoreContext: React.FC< TableWithStoreContextProps > = ( {
	locale,
	rootUrl,
	urlQueryArgs,
} ) => {
	const createCheckoutURL = useMemo(
		() => getPurchaseURLCallback( '', urlQueryArgs, locale ),
		[ locale, urlQueryArgs ]
	);
	const dispatch = useDispatch();

	const onClickPurchase = useCallback< PurchaseCallback >(
		( product ) => {
			dispatch(
				recordTracksEvent( 'calypso_jetpack_comparison_page_product_click', {
					product_slug: product.productSlug,
					duration: TERM_ANNUALLY,
					path: rootUrl,
				} )
			);
		},
		[ dispatch, rootUrl ]
	);

	const storeItemInfo = useStoreItemInfo( {
		duration: TERM_ANNUALLY,
		siteId: null,
		createCheckoutURL,
		onClickPurchase,
	} );

	return (
		<StoreItemInfoContext.Provider value={ storeItemInfo }>
			<Table />
		</StoreItemInfoContext.Provider>
	);
};

export const TableWithStoreAccess: React.FC< TableWithStoreContextProps > = ( {
	locale,
	rootUrl,
	urlQueryArgs,
} ) => {
	return (
		<CalypsoShoppingCartProvider>
			<TableWithStoreContext locale={ locale } rootUrl={ rootUrl } urlQueryArgs={ urlQueryArgs } />
		</CalypsoShoppingCartProvider>
	);
};
