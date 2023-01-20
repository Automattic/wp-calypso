import { Button, Gridicon } from '@automattic/components';
import { PureComponent } from 'react';
import formatCurrency from 'calypso/../packages/format-currency/src';
import upsellImage from 'calypso/assets/images/checkout-upsell/upsell-rocket.png';
import DocumentHead from 'calypso/components/data/document-head';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';

import './style.scss';

export class BusinessPlanUpgradeUpsell extends PureComponent {
	render() {
		const { receiptId, translate } = this.props;

		const title = translate( 'Checkout ‹ Plan Upgrade', {
			comment: '"Checkout" is the part of the site where a user is preparing to make a purchase.',
		} );

		return (
			<>
				<PageViewTracker
					path="/checkout/:site/offer-plan-upgrade/:upgrade_item/:receipt_id"
					title={ title }
					properties={ { upgrade_item: 'business' } }
				/>
				<DocumentHead title={ title } />
				<div className="business-plan-upgrade-upsell-new-design__header">
					{ receiptId ? this.header() : '' }
					<div className="business-plan-upgrade-upsell-new-design__header-title">
						{ this.title() }
					</div>
				</div>
				<div className="business-plan-upgrade-upsell-new-design__container">
					<div className="business-plan-upgrade-upsell-new-design__body">{ this.body() }</div>
					<div className="business-plan-upgrade-upsell-new-design__image-container">
						{ this.image() }
					</div>
					<div className="business-plan-upgrade-upsell-new-design__footer">{ this.footer() }</div>
				</div>
			</>
		);
	}

	header() {
		const { translate } = this.props;

		return (
			<header className="business-plan-upgrade-upsell-new-design__small-header">
				<h1 className="business-plan-upgrade-upsell-new-design__small-header-title">
					{ translate( 'Limited time offer' ) }
				</h1>
			</header>
		);
	}

	image() {
		return (
			<img className="business-plan-upgrade-upsell-new-design__image" src={ upsellImage } alt="" />
		);
	}

	title() {
		const { translate } = this.props;
		return (
			<>
				<h2 className="business-plan-upgrade-upsell-new-design__title">
					{ translate( 'Upgrade your site to the most powerful plan ever' ) }
				</h2>
			</>
		);
	}

	body() {
		const {
			translate,
			planRawPrice,
			planDiscountedRawPrice,
			currencyCode,
			hasSevenDayRefundPeriod,
		} = this.props;
		return (
			<>
				<div className="business-plan-upgrade-upsell-new-design__column-pane">
					<p>{ translate( 'Unlock the power of the Business Plan and gain access to:' ) }</p>
					<ul className="business-plan-upgrade-upsell-new-design__checklist">
						<li className="business-plan-upgrade-upsell-new-design__checklist-item">
							<Gridicon
								icon="checkmark"
								className="business-plan-upgrade-upsell-new-design__checklist-item-icon"
							/>
							<span className="business-plan-upgrade-upsell-new-design__checklist-item-text">
								{ translate(
									'Using any WordPress plugins and extending the functionality of your website.'
								) }
							</span>
						</li>
						<li className="business-plan-upgrade-upsell-new-design__checklist-item">
							<Gridicon
								icon="checkmark"
								className="business-plan-upgrade-upsell-new-design__checklist-item-icon"
							/>
							<span className="business-plan-upgrade-upsell-new-design__checklist-item-text">
								{ translate( 'Uploading any WordPress themes purchased or downloaded elsewhere.' ) }
							</span>
						</li>
						<li className="business-plan-upgrade-upsell-new-design__checklist-item">
							<Gridicon
								icon="checkmark"
								className="business-plan-upgrade-upsell-new-design__checklist-item-icon"
							/>
							<span className="business-plan-upgrade-upsell-new-design__checklist-item-text">
								{ translate( 'Enjoying automated Jetpack backups & one-click website restores.' ) }
							</span>
						</li>
						<li className="business-plan-upgrade-upsell-new-design__checklist-item">
							<Gridicon
								icon="checkmark"
								className="business-plan-upgrade-upsell-new-design__checklist-item-icon"
							/>
							<span className="business-plan-upgrade-upsell-new-design__checklist-item-text">
								{ translate( 'Setting up SFTP and database credentials.' ) }
							</span>
						</li>
					</ul>
					<p>
						{ translate(
							'The great news is that you can upgrade today and try the Business Plan risk-free thanks to our 14-day money-back guarantee. Simply click below to upgrade. You’ll only have to pay the difference to the Premium Plan ({{del}}%(fullPrice)s{{/del}} %(discountPrice)s).',
							{
								components: {
									del: <del />,
									b: <b />,
								},
								args: {
									days: hasSevenDayRefundPeriod ? 7 : 14,
									fullPrice: formatCurrency( planRawPrice, currencyCode, { stripZeros: true } ),
									discountPrice: formatCurrency( planDiscountedRawPrice, currencyCode, {
										stripZeros: true,
									} ),
									comment: 'A monetary value at the end, e.g. $25',
								},
							}
						) }
					</p>
				</div>
			</>
		);
	}

	footer() {
		const { translate, handleClickAccept, handleClickDecline } = this.props;
		return (
			<footer className="business-plan-upgrade-upsell-new-design__footer">
				<Button
					data-e2e-button="decline"
					className="business-plan-upgrade-upsell-new-design__decline-offer-button"
					onClick={ handleClickDecline }
				>
					{ translate( 'No Thanks' ) }
				</Button>
				<Button
					primary
					className="business-plan-upgrade-upsell-new-design__accept-offer-button"
					onClick={ () => handleClickAccept( 'accept' ) }
				>
					{ translate( 'Upgrade Now' ) }
				</Button>
			</footer>
		);
	}
}
