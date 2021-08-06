import { useTranslate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import googleWorkspaceLogo from 'calypso/assets/images/email-providers/google-workspace/logo.svg';
import GSuiteCompactFeatures from 'calypso/components/gsuite/gsuite-features/compact';
import GSuitePrice from 'calypso/components/gsuite/gsuite-price';
import { isGoogleWorkspaceProductSlug } from 'calypso/lib/gsuite';
import { GSUITE_SLUG_PROP_TYPES } from 'calypso/lib/gsuite/constants';
import { getCurrentUserCurrencyCode } from 'calypso/state/currency-code/selectors';
import { getProductBySlug } from 'calypso/state/products-list/selectors';

function GSuiteUpsellProductDetails( { currencyCode, domain, product, productSlug } ) {
	const translate = useTranslate();

	return (
		<div className="gsuite-upsell-card__product-details">
			<div className="gsuite-upsell-card__product-intro">
				<div className="gsuite-upsell-card__product-presentation">
					{ isGoogleWorkspaceProductSlug( productSlug ) ? (
						<img src={ googleWorkspaceLogo } alt="Google Workspace" />
					) : (
						<span className="gsuite-upsell-card__product-logo">G Suite</span>
					) }

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
