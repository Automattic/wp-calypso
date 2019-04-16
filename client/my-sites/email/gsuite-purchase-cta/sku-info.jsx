/** @format */

/**
 * External dependencies
 */
import { noop } from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/forms/form-button';
import { getAnnualPrice, getMonthlyPrice } from 'lib/gsuite';
import InfoPopover from 'components/info-popover';

function GSuitePurchaseCtaSkuInfo( {
	buttonText,
	currencyCode,
	onButtonClick,
	showButton,
	showMonthlyPrice,
	skuCost,
	skuName,
	storageText,
	storageNoticeText,
} ) {
	const translate = useTranslate();

	const annualPrice = skuCost && currencyCode ? getAnnualPrice( skuCost, currencyCode ) : '-';
	const monthlyPrice = skuCost && currencyCode ? getMonthlyPrice( skuCost, currencyCode ) : '-';

	return (
		<div className="gsuite-purchase-cta__sku-info">
			{ skuName && (
				<div className="gsuite-purchase-cta__sku-info-name-area">
					<h3>{ skuName }</h3>
				</div>
			) }
			{ storageText && (
				<div className="gsuite-purchase-cta__sku-info-storage-area">
					<h4>{ storageText }</h4>
					{ storageNoticeText && <InfoPopover>{ storageNoticeText }</InfoPopover> }
				</div>
			) }
			<h4 className="gsuite-purchase-cta__sku-info-name-price-per-user">
				<span>
					{ ! showMonthlyPrice &&
						translate( '{{strong}}%(price)s{{/strong}} per user / year', {
							components: {
								strong: <strong />,
							},
							args: {
								price: annualPrice,
							},
						} ) }
					{ showMonthlyPrice &&
						translate( '{{strong}}%(price)s{{/strong}} per user / month', {
							components: {
								strong: <strong />,
							},
							args: {
								price: monthlyPrice,
							},
						} ) }
				</span>
			</h4>
			{ showMonthlyPrice && (
				<h5 className="gsuite-purchase-cta__sku-info-annual-price">
					{ translate( '%(price)s billed yearly', {
						args: {
							price: annualPrice,
						},
					} ) }
				</h5>
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
	buttonText: PropTypes.string,
	currencyCode: PropTypes.string,
	showButton: PropTypes.bool,
	showMonthlyPrice: PropTypes.bool,
	onButtonClick: PropTypes.func,
	skuCost: PropTypes.number,
	skuName: PropTypes.string,
	storageText: PropTypes.string,
	storageNoticeText: PropTypes.string,
};

GSuitePurchaseCtaSkuInfo.defaultProps = {
	buttonText: 'Click Here',
	showButton: true,
	showMonthlyPrice: false,
	onButtonClick: noop,
};

export default GSuitePurchaseCtaSkuInfo;
