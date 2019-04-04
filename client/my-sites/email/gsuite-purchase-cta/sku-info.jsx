/** @format */

/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/forms/form-button';

function GSuitePurchaseCtaSkuInfo( {
	annualPrice,
	buttonText,
	showButton,
	onButtonClick,
	skuName,
	skuSubText,
	translate,
} ) {
	return (
		<div className="gsuite-purchase-cta__sku-info">
			<h3 className="gsuite-purchase-cta__sku-info-name">{ skuName }</h3>
			<h4 className="gsuite-purchase-cta__sku-info-name-price-per-user">
				<span>
					{ translate( '{{strong}}%(price)s{{/strong}} per user / year', {
						components: {
							strong: <strong />,
						},
						args: {
							price: annualPrice,
						},
					} ) }
				</span>
			</h4>
			<h5 className="gsuite-purchase-cta__sku-info-name-storage">{ skuSubText }</h5>
			{ showButton && (
				<Button type="button" onClick={ onButtonClick }>
					{ buttonText }
				</Button>
			) }
		</div>
	);
}

export default localize( GSuitePurchaseCtaSkuInfo );
