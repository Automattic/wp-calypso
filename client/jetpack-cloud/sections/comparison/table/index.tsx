import { TERM_ANNUALLY } from '@automattic/calypso-products';
import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { Fragment, useMemo } from 'react';
import ProductLightbox from 'calypso/my-sites/plans/jetpack-plans/product-lightbox';
import StoreItemInfoContext, {
	useStoreItemInfoContext,
} from 'calypso/my-sites/plans/jetpack-plans/product-store/context/store-item-info-context';
import { useProductLightbox } from 'calypso/my-sites/plans/jetpack-plans/product-store/hooks/use-product-lightbox';
import { useStoreItemInfo } from 'calypso/my-sites/plans/jetpack-plans/product-store/hooks/use-store-item-info';
import { MoreInfoLink } from 'calypso/my-sites/plans/jetpack-plans/product-store/more-info-link';
import slugToSelectorProduct from 'calypso/my-sites/plans/jetpack-plans/slug-to-selector-product';
import { SelectorProduct } from 'calypso/my-sites/plans/jetpack-plans/types';
import { getPurchaseURLCallback } from '../../../../my-sites/plans/jetpack-plans/get-purchase-url-callback';
import { TableWithStoreContextProps } from '../types';
import { links } from './links';
import { useComparisonData } from './useComparisonData';
import { useProductsToCompare } from './useProductsToCompare';

import './style.scss';

export const Table: React.FC = () => {
	const translate = useTranslate();

	const productsToCompare = useProductsToCompare();

	const data = useComparisonData();

	const { currentProduct, setCurrentProduct, onClickMoreInfoFactory } = useProductLightbox();
	const { getCheckoutURL, getCtaLabel, getIsExternal, getOnClickPurchase } =
		useStoreItemInfoContext();

	const sectionHeadingColSpan = productsToCompare.length + 1;

	const headerRow = (
		<tr className="header-row">
			<th></th>
			{ productsToCompare.map( ( { id, name, productSlug } ) => {
				const item = slugToSelectorProduct( productSlug ) as SelectorProduct;

				const isFree = 'FREE' === id;

				return (
					<th key={ id } scope="col" className={ `product product-jetpack-${ id.toLowerCase() }` }>
						<div className="pricing-comparison__product-header">
							<span className="pricing-comparison__product-header--title">{ name }</span>

							<Button
								className="pricing-comparison__product-header--cta"
								primary={ ! isFree }
								onClick={ ! isFree ? getOnClickPurchase( item ) : undefined }
								target={ ! isFree && getIsExternal( item ) ? '_blank' : undefined }
								href={ ! isFree ? getCheckoutURL( item ) : '' }
							>
								{ isFree ? translate( 'Get started' ) : getCtaLabel( item, '' ) }
							</Button>
							{ isFree ? (
								<span className="more-info-link">{ translate( 'Get started for free' ) }</span>
							) : (
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

export const TableWithStoreContext: React.FC< TableWithStoreContextProps > = ( {
	locale,
	urlQueryArgs,
} ) => {
	const createCheckoutURL = useMemo(
		() => getPurchaseURLCallback( '', urlQueryArgs, locale ),
		[ locale, urlQueryArgs ]
	);

	const storeItemInfo = useStoreItemInfo( {
		duration: TERM_ANNUALLY,
		siteId: null,
		createCheckoutURL,
	} );

	return (
		<StoreItemInfoContext.Provider value={ storeItemInfo }>
			<Table />
		</StoreItemInfoContext.Provider>
	);
};
