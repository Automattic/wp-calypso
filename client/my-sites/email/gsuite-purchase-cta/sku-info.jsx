/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/forms/form-button';
import InfoPopover from 'components/info-popover';

function GSuitePurchaseCtaSkuInfo( {
	annualPrice,
	buttonText,
	onButtonClick,
	showButton,
	skuName,
	skuStorage,
	skuStorageNotice,
} ) {
	const translate = useTranslate();
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
			{ skuStorage && (
				<div className="gsuite-purchase-cta__sku-info-storage-area">
					<h5>{ skuStorage }</h5>
					{ skuStorageNotice && <InfoPopover>{ skuStorageNotice }</InfoPopover> }
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
	skuStorage: PropTypes.string,
	skuStorageNotice: PropTypes.string,
};

export default GSuitePurchaseCtaSkuInfo;
