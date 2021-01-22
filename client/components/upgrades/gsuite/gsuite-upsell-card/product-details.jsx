/**
 * External dependencies
 */
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslate } from 'i18n-calypso';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import { getCurrentUserCurrencyCode } from 'calypso/state/current-user/selectors';
import { getProductBySlug } from 'calypso/state/products-list/selectors';
import GSuitePrice from 'calypso/components/gsuite/gsuite-price';
import GSuiteCompactFeatures from 'calypso/components/gsuite/gsuite-features/compact';
import { GSUITE_SLUG_PROP_TYPES } from 'calypso/lib/gsuite/constants';
import { getGoogleMailServiceFamily } from 'calypso/lib/gsuite';
import config from 'calypso/config';

function GSuiteUpsellProductDetails( { currencyCode, domain, product, productSlug } ) {
	const translate = useTranslate();
	const serviceName = getGoogleMailServiceFamily();

	const logoClass = classNames( 'gsuite-upsell-card__product-logo', {
		'google-workspace': config.isEnabled( 'google-workspace-migration' ),
	} );

	return (
		<div className="gsuite-upsell-card__product-details">
			<div className="gsuite-upsell-card__product-intro">
				<div className="gsuite-upsell-card__product-presentation">
					<div className="gsuite-upsell-card__product-name">
						<span className={ logoClass }>{ serviceName }</span>
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
