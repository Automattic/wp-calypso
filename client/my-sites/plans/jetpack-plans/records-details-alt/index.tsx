/**
 * External dependencies
 */
import { useTranslate, numberFormat } from 'i18n-calypso';
import React, { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import { slugToSelectorProduct } from '../utils';
import { getJetpackProducts } from 'calypso/lib/products-values/translations';
import { getCurrentUserCurrencyCode } from 'calypso/state/current-user/selectors';
import { getAvailableProductsBySiteId } from 'calypso/state/sites/products/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

/**
 * Style dependencies
 */
import '../records-details/styles.scss';

/**
 * Type dependencies
 */
import type { ProductTranslations } from 'calypso/lib/products-values/types';

type Props = {
	productSlug: string;
};

const RecordsDetailsAlt: FunctionComponent< Props > = ( { productSlug } ) => {
	const selectorProduct = slugToSelectorProduct( productSlug );

	const translate = useTranslate();
	const currencyCode = useSelector( ( state ) => getCurrentUserCurrencyCode( state ) );
	const siteId = useSelector( ( state ) => getSelectedSiteId( state ) );
	const products = useSelector(
		( state ) => siteId && getAvailableProductsBySiteId( state, siteId )
	)?.data;

	if ( ! selectorProduct || ! currencyCode || ! siteId ) {
		return null;
	}

	const searchProduct = products?.[ productSlug ];

	if ( ! searchProduct ) {
		return null;
	}

	const recordCount = searchProduct?.price_tier_usage_quantity;
	const translations = getJetpackProducts().find( ( p ) => p.slugs.includes( productSlug ) ) as
		| ProductTranslations
		| undefined;
	const tier = translations?.optionShortNamesCallback?.( searchProduct );

	return (
		<div className="records-details-alt">
			<div className="records-details-alt__records">
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
			</div>
			<p className="records-details-alt__tier">{ tier }</p>
		</div>
	);
};

export default RecordsDetailsAlt;
