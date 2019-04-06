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
import InfoPopover from 'components/info-popover';

function GSuitePurchaseCtaSkuInfo( {
	annualPrice,
	buttonText,
	showButton,
	onButtonClick,
	skuName,
	skuSubNoticeText,
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
			<div className="gsuite-purchase-cta__sku-info-sub-text">
				<h5>{ skuSubText }</h5>
				{ skuSubNoticeText && <InfoPopover>{ skuSubNoticeText }</InfoPopover> }
			</div>
			{ showButton && (
				<Button type="button" onClick={ onButtonClick }>
					{ buttonText }
				</Button>
			) }
		</div>
	);
}

export default localize( GSuitePurchaseCtaSkuInfo );
