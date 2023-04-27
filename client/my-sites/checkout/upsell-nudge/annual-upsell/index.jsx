import { Button } from '@automattic/components';
import formatCurrency from 'calypso/../packages/format-currency/src';
import upsellImage from 'calypso/assets/images/checkout-upsell/upsell-annual.png';
import DocumentHead from 'calypso/components/data/document-head';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';

import './style.scss';

const AnnualUpsell = ( {
	currencyCode,
	planDiscountedRawPrice,
	translate,
	handleClickAccept,
	handleClickDecline,
	upgradeItem,
	currentProduct,
} ) => {
	const title = translate( 'Checkout ‹ Plan Upgrade', {
		comment: '"Checkout" is the part of the site where a user is preparing to make a purchase.',
	} );

	// The cost is the monthly plan cost, so we multiply by 12 to get the annual cost.
	const currentAnnualPrice = currentProduct.cost * 12;

	const header = () => (
		<div className="annual-plan-upgrade-upsell__header-title">
			<h2 className="annual-plan-upgrade-upsell__title">
				{ translate( 'Switch to an Annual Plan and Save %(savings)d%', {
					args: {
						savings: Math.round(
							( ( currentAnnualPrice - planDiscountedRawPrice ) / currentAnnualPrice ) * 100
						),
					},
					comment: '%(savings)d is a numeric discount percentage, e.g. 30',
				} ) }
			</h2>
		</div>
	);
	const image = () => {
		return (
			<img className="annual-plan-upgrade-upsell__image" src={ upsellImage } alt="" width="454" />
		);
	};

	const body = () => (
		<div className="annual-plan-upgrade-upsell__column-pane">
			<p>
				{ translate(
					'When choosing annual billing, you’ll save on your WordPress.com subscription and get a custom domain name free for the first year.'
				) }
			</p>
			<p>
				{ translate( 'That’s a total savings of %(savingsPrice)s!', {
					args: {
						savingsPrice: formatCurrency(
							currentAnnualPrice - planDiscountedRawPrice,
							currencyCode,
							{
								stripZeros: true,
							}
						),
					},
					comment: '%(savingsPrice)s is a monetary value, e.g. $25',
				} ) }
			</p>
			<p>
				{ translate(
					'Ready to start saving? Click {{strong}}Add to cart{{/strong}} below to get started.',
					{
						components: { strong: <strong /> },
					}
				) }
			</p>
		</div>
	);

	const footer = () => (
		<footer>
			<Button
				primary
				className="annual-plan-upgrade-upsell__accept-offer-button"
				onClick={ () => handleClickAccept( 'accept' ) }
			>
				{ translate( 'Add to cart' ) }
			</Button>
			<Button
				data-e2e-button="decline"
				className="annual-plan-upgrade-upsell__decline-offer-button"
				onClick={ handleClickDecline }
			>
				{ translate( 'Consider later' ) }
			</Button>
		</footer>
	);

	return (
		<>
			<PageViewTracker
				path="/checkout/:site/offer-plan-upgrade/:upgrade_item/:receipt_id"
				title={ title }
				properties={ { upgrade_item: upgradeItem } }
			/>
			<DocumentHead title={ title } />
			<div className="annual-plan-upgrade-upsell__container">
				<div className="annual-plan-upgrade-upsell__header">{ header() }</div>
				<div className="annual-plan-upgrade-upsell__body">{ body() }</div>
				<div className="annual-plan-upgrade-upsell__image-container">{ image() }</div>
				<div className="annual-plan-upgrade-upsell__footer">{ footer() }</div>
			</div>
		</>
	);
};

export default AnnualUpsell;
