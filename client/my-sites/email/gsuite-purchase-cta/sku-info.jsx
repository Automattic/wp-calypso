/** @format */

/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React from 'react';

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
			{ skuName && (
				<div className="gsuite-purchase-cta__sku-info-name-area">
					<h3>{ skuName }</h3>
				</div>
			) }
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
			{ skuSubText && (
				<div className="gsuite-purchase-cta__sku-info-sub-text-area">
					<h5>{ skuSubText }</h5>
					{ skuSubNoticeText && <InfoPopover>{ skuSubNoticeText }</InfoPopover> }
				</div>
			) }
			{ showButton && (
				<Button
					className="gsuite-purchase-cta__sku-info-button"
					onClick={ onButtonClick }
					type="button"
				>
					{ buttonText }
				</Button>
			) }
		</div>
	);
}

GSuitePurchaseCtaSkuInfo.propTypes = {
	annualPrice: PropTypes.string.isRequired,
	buttonText: PropTypes.string.isRequired,
	showButton: PropTypes.bool.isRequired,
	onButtonClick: PropTypes.func.isRequired,
	skuName: PropTypes.string,
	skuSubNoticeText: PropTypes.string,
	skuSubText: PropTypes.string,
	translate: PropTypes.func.isRequired,
};

export default localize( GSuitePurchaseCtaSkuInfo );
