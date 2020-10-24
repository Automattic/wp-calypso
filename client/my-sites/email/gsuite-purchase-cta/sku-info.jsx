/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal dependencies
 */
import InfoPopover from 'calypso/components/info-popover';

function GSuitePurchaseCtaSkuInfo( { skuName, storageText, storageNoticeText } ) {
	return (
		<div className="gsuite-purchase-cta__sku-info">
			<div className="gsuite-purchase-cta__sku-info-name-area">
				<h3>{ skuName }</h3>
			</div>

			<div className="gsuite-purchase-cta__sku-info-storage-area">
				<h4>{ storageText }</h4>
				{ storageNoticeText && <InfoPopover>{ storageNoticeText }</InfoPopover> }
			</div>
		</div>
	);
}

GSuitePurchaseCtaSkuInfo.propTypes = {
	skuName: PropTypes.string.isRequired,
	storageText: PropTypes.string.isRequired,
	storageNoticeText: PropTypes.string,
};

export default GSuitePurchaseCtaSkuInfo;
