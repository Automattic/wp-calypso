/**
 * External dependencies
 */
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { getCurrentUserCurrencyCode } from 'state/current-user/selectors';
import { getProductBySlug } from 'state/products-list/selectors';
import GSuitePrice from 'components/gsuite/gsuite-price';
import GSuiteCompactFeatures from 'components/gsuite/gsuite-features/compact';
import { GSUITE_SLUG_PROP_TYPES } from 'lib/gsuite/constants';

function GSuiteUpsellProductDetails( { currencyCode, domain, product, productSlug } ) {
	const translate = useTranslate();

	return (
		<div className="gsuite-upsell-card__product-details">
			<div className="gsuite-upsell-card__product-intro">
				<div className="gsuite-upsell-card__product-presentation">
					<div className="gsuite-upsell-card__product-name">
						{ /* Intentionally not translated as it is a brand name and Google keeps it in English */ }
						<span className="gsuite-upsell-card__product-logo">G Suite</span>
					</div>

					<p>
						{ translate(
							"We've teamed up with Google to offer you email, storage, docs, calendars, " +
								'and more, integrated with your site.'
						) }
					</p>
				</div>

				<GSuiteCompactFeatures domainName={ domain } productSlug={ productSlug } type={ 'list' } />
			</div>

			<GSuitePrice product={ product } currencyCode={ currencyCode } />
		</div>
	);
}

GSuiteUpsellProductDetails.propTypes = {
	currencyCode: PropTypes.string,
	domain: PropTypes.string.isRequired,
	product: PropTypes.object,
	productSlug: GSUITE_SLUG_PROP_TYPES,
};

export default connect( ( state, { productSlug } ) => ( {
	currencyCode: getCurrentUserCurrencyCode( state ),
	product: getProductBySlug( state, productSlug ),
} ) )( GSuiteUpsellProductDetails );
