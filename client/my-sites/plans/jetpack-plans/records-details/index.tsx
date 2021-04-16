/**
 * External dependencies
 */
import { useTranslate, numberFormat } from 'i18n-calypso';
import React, { FunctionComponent, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import { recordTracksEvent } from 'calypso/state/analytics/actions/record';
import useItemPrice from '../use-item-price';
import { slugToSelectorProduct, durationToText } from '../utils';
import InfoPopover from 'calypso/components/info-popover';
import { preventWidows } from 'calypso/lib/formatting';
import { getJetpackProducts } from '@automattic/calypso-products';
import PlanPrice from 'calypso/my-sites/plan-price';
import { getCurrentUserCurrencyCode } from 'calypso/state/current-user/selectors';
import { getAvailableProductsBySiteId } from 'calypso/state/sites/products/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

/**
 * Style dependencies
 */
import './styles.scss';

/**
 * Type dependencies
 */
import type { ProductTranslations } from '@automattic/calypso-products';

type Props = {
	productSlug: string;
};

const RecordsDetails: FunctionComponent< Props > = ( { productSlug } ) => {
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

	const dispatch = useDispatch();
	const onOpenPopover = useCallback(
		() =>
			dispatch(
				recordTracksEvent( 'calypso_plans_infopopover_open', {
					site_id: siteId || undefined,
					item_slug: 'jetpack-search-record-count',
				} )
			),
		[ dispatch, siteId ]
	);

	if ( ! selectorProduct || ! currencyCode || ! siteId || isFetching ) {
		return null;
	}

	const searchProduct = products?.[ productSlug ];

	if ( ! searchProduct ) {
		return null;
	}

	const isDiscounted = Number.isFinite( discountedPrice );
	const recordCount = searchProduct?.price_tier_usage_quantity;
	const translations = getJetpackProducts().find( ( p ) => p.slugs.includes( productSlug ) ) as
		| ProductTranslations
		| undefined;
	const tier = translations?.optionShortNamesCallback?.( searchProduct );

	return (
		<div className="records-details">
			<div className="records-details__records">
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
				<InfoPopover onOpen={ onOpenPopover }>
					{ preventWidows(
						translate(
							'Records are all posts, pages, custom post types and other types of content indexed by Jetpack Search. {{link}}Learn more.{{/link}}',
							{
								components: {
									link: <a href="https://jetpack.com/upgrade/search/"></a>,
								},
							}
						)
					) }
				</InfoPopover>
			</div>
			<div className="records-details__details">
				<p className="records-details__tier">{ tier }</p>
				<div className="records-details__price">
					<PlanPrice
						rawPrice={ originalPrice }
						original={ isDiscounted }
						currencyCode={ currencyCode }
					/>
					{ isDiscounted && (
						<PlanPrice rawPrice={ discountedPrice } discounted currencyCode={ currencyCode } />
					) }
				</div>
				<p className="records-details__timeframe">{ durationToText( selectorProduct.term ) }</p>
			</div>
		</div>
	);
};

export default RecordsDetails;
