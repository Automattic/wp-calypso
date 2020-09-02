/**
 * External dependencies
 */
import { useTranslate, numberFormat } from 'i18n-calypso';
import { isFinite } from 'lodash';
import React, { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import useItemPrice from '../use-item-price';
import { slugToSelectorProduct, durationToText } from '../utils';
import InfoPopover from 'components/info-popover';
import { preventWidows } from 'lib/formatting';
import { getJetpackProducts } from 'lib/products-values/translations';
import PlanPrice from 'my-sites/plan-price';
import { getCurrentUserCurrencyCode } from 'state/current-user/selectors';
import { getAvailableProductsBySiteId } from 'state/sites/products/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';

type Props = {
	productSlug: string;
};

const RecordsSlider: FunctionComponent< Props > = ( { productSlug } ) => {
	const selectorProduct = slugToSelectorProduct( productSlug );

	const translate = useTranslate();
	const currencyCode = useSelector( ( state ) => getCurrentUserCurrencyCode( state ) );
	const siteId = useSelector( ( state ) => getSelectedSiteId( state ) );
	const products = useSelector(
		( state ) => siteId && getAvailableProductsBySiteId( state, siteId )
	)?.data;
	const { isFetching, originalPrice, discountedPrice } = useItemPrice(
		siteId,
		selectorProduct,
		selectorProduct?.monthlyProductSlug
	);

	const isDiscounted = isFinite( discountedPrice );
	const searchProduct = products?.[ productSlug ];
	const recordCount = searchProduct?.price_tier_usage_quantity;

	if ( ! searchProduct || ! selectorProduct || ! currencyCode || isFetching ) {
		return null;
	}

	const tierText = getJetpackProducts()
		.find( ( i ) => i.slugs.includes( productSlug ) )
		?.optionShortNamesCallback( searchProduct );

	return (
		<div className="records-slider">
			<div className="records-slider__records">
				{ translate(
					'Your site has %(recordCount)s record',
					'Your site has %(recordCount)s records',
					{
						count: recordCount,
						args: {
							recordCount: numberFormat( recordCount, 0 ),
						},
						comment: '%(recordCount)s is the number of search records of the site',
					}
				) }
				<InfoPopover>
					{ preventWidows(
						translate( '{{link}}Learn more.{{/link}}', {
							components: {
								link: <a href="https://jetpack.com/upgrade/search/"></a>,
							},
						} )
					) }
				</InfoPopover>
			</div>
			<div className="records-slider__details">
				<p className="records-slider__tier">{ tierText }</p>
				<div className="records-slider__price">
					<PlanPrice
						rawPrice={ originalPrice }
						original={ isDiscounted }
						currencyCode={ currencyCode }
					/>
					{ isDiscounted && (
						<PlanPrice rawPrice={ discountedPrice } discounted currencyCode={ currencyCode } />
					) }
				</div>
				<p className="records-slider__timeframe">{ durationToText( selectorProduct.term ) }</p>
			</div>
		</div>
	);
};

export default RecordsSlider;
