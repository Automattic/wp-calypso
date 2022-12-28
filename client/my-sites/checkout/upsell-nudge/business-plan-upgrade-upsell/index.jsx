import { Button, Gridicon } from '@automattic/components';
import { PureComponent } from 'react';
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
				<div className="business-plan-upgrade-upsell__header">
					{ receiptId ? this.header() : '' }
					<div className="business-plan-upgrade-upsell__header-title">{ this.title() }</div>
				</div>
				<div className="business-plan-upgrade-upsell__container">
					<div className="business-plan-upgrade-upsell__body">{ this.body() }</div>
					<div className="business-plan-upgrade-upsell__image-container">{ this.image() }</div>
					<div className="business-plan-upgrade-upsell__footer">{ this.footer() }</div>
				</div>
			</>
		);
	}

	header() {
		const { translate } = this.props;

		return (
			<header className="business-plan-upgrade-upsell__small-header">
				<h1 className="business-plan-upgrade-upsell__small-header-title">
					{ translate( 'Limited time offer' ) }
				</h1>
			</header>
		);
	}

	image() {
		return <img className="business-plan-upgrade-upsell__image" src={ upsellImage } alt="" />;
	}

	title() {
		const { translate } = this.props;
		return (
			<>
				<h2 className="business-plan-upgrade-upsell__title">
					{ translate( 'Upgrade your site to the most powerful plan ever' ) }
				</h2>
			</>
		);
	}

	body() {
		const {
			translate,
			// planRawPrice,
			// planDiscountedRawPrice,
			// currencyCode,
			// hasSevenDayRefundPeriod,
		} = this.props;
		return (
			<>
				<div className="business-plan-upgrade-upsell__column-pane">
					<p>{ translate( 'Unlock the power of the Business Plan and gain access to::' ) }</p>
					<ul className="business-plan-upgrade-upsell__checklist">
						<li className="business-plan-upgrade-upsell__checklist-item">
							<Gridicon
								icon="checkmark"
								className="business-plan-upgrade-upsell__checklist-item-icon"
							/>
							<span className="business-plan-upgrade-upsell__checklist-item-text">
								{ translate(
									'Using any WordPress plugins and extending the functionality of your website.'
								) }
							</span>
						</li>
						<li className="business-plan-upgrade-upsell__checklist-item">
							<Gridicon
								icon="checkmark"
								className="business-plan-upgrade-upsell__checklist-item-icon"
							/>
							<span className="business-plan-upgrade-upsell__checklist-item-text">
								{ translate( 'Upload any WordPress themes purchased or downloaded elsewhere.' ) }
							</span>
						</li>
						<li className="business-plan-upgrade-upsell__checklist-item">
							<Gridicon
								icon="checkmark"
								className="business-plan-upgrade-upsell__checklist-item-icon"
							/>
							<span className="business-plan-upgrade-upsell__checklist-item-text">
								{ translate( 'Enjoying automated Jetpack backups & one-click website restores.' ) }
							</span>
						</li>
						<li className="business-plan-upgrade-upsell__checklist-item">
							<Gridicon
								icon="checkmark"
								className="business-plan-upgrade-upsell__checklist-item-icon"
							/>
							<span className="business-plan-upgrade-upsell__checklist-item-text">
								{ translate( 'Gaining SFTP and database access.' ) }
							</span>
						</li>
					</ul>
					<p>
						{ translate(
							'The great news is that you can upgrade today and try the Business Plan risk-free thanks to our 14-day money-back guarantee. Simply click below to upgrade. You’ll only have to pay the difference to the Premium Plan ($XX).'
						) }
					</p>
				</div>
			</>
		);
	}

	footer() {
		const { translate, handleClickAccept, handleClickDecline } = this.props;
		return (
			<footer className="business-plan-upgrade-upsell__footer">
				<Button
					primary
					className="business-plan-upgrade-upsell__accept-offer-button"
					onClick={ () => handleClickAccept( 'accept' ) }
				>
					{ translate( 'Upgrade Now' ) }
				</Button>
				<Button
					data-e2e-button="decline"
					className="business-plan-upgrade-upsell__decline-offer-button"
					onClick={ handleClickDecline }
				>
					{ translate( 'No Thanks' ) }
				</Button>
			</footer>
		);
	}
}
