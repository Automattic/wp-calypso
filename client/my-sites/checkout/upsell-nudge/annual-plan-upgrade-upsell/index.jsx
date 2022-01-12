import { CompactCard, Button, Gridicon } from '@automattic/components';
import formatCurrency from '@automattic/format-currency';
import { PureComponent } from 'react';
import premiumThemesImage from 'calypso/assets/images/illustrations/themes.svg';
import DocumentHead from 'calypso/components/data/document-head';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';

import './style.scss';

export class AnnualPlanUpgradeUpsell extends PureComponent {
	render() {
		const { receiptId, upgradeItem } = this.props;
		const title = 'Checkout ‹ Annual Plan Upgrade';

		return (
			<>
				<PageViewTracker
					path="/checkout/:site/offer-annual-upgrade/:upgrade_item/:receipt_id"
					title={ title }
					properties={ { upgrade_item: upgradeItem } }
				/>
				<DocumentHead title={ title } />
				{ receiptId ? (
					<CompactCard className="annual-plan-upgrade-upsell__card-header">
						{ this.header() }
					</CompactCard>
				) : (
					''
				) }
				<CompactCard className="annual-plan-upgrade-upsell__card-body">{ this.body() }</CompactCard>
				<CompactCard className="annual-plan-upgrade-upsell__card-footer">
					{ this.footer() }
				</CompactCard>
			</>
		);
	}

	header() {
		return (
			<header className="annual-plan-upgrade-upsell__small-header">
				<h2 className="annual-plan-upgrade-upsell__title">
					Hold tight, we're getting your site ready
				</h2>
			</header>
		);
	}

	body() {
		const {
			pricePerMonthForAnnualPlan,
			pricePerMonthForMonthlyPlan,
			currencyCode,
			annualPlanSlug,
		} = this.props;
		const discountRate = Math.ceil(
			100 *
				( ( pricePerMonthForMonthlyPlan - pricePerMonthForAnnualPlan ) /
					pricePerMonthForMonthlyPlan )
		);
		const annualPlanSavings = Math.ceil(
			( pricePerMonthForMonthlyPlan - pricePerMonthForAnnualPlan ) * 12
		);
		const formattedAnnualSavings = formatCurrency( annualPlanSavings, currencyCode, {
			stripZeros: true,
		} );
		return (
			<>
				<h2 className="annual-plan-upgrade-upsell__header">
					Upgrade to an annual plan to save { discountRate }% and get a free domain!
				</h2>

				<div className="annual-plan-upgrade-upsell__column-pane">
					<div className="annual-plan-upgrade-upsell__column-content">
						<p>
							<b>An annual plan gets you these amazing benefits:</b>
						</p>
						<ul className="annual-plan-upgrade-upsell__checklist">
							<li className="annual-plan-upgrade-upsell__checklist-item">
								<Gridicon
									icon="checkmark"
									className="annual-plan-upgrade-upsell__checklist-item-icon"
								/>
								<span className="annual-plan-upgrade-upsell__checklist-item-text">
									{ discountRate }% in savings: That is { formattedAnnualSavings } back in your
									pocket.
								</span>
							</li>
							<li className="annual-plan-upgrade-upsell__checklist-item">
								<Gridicon
									icon="checkmark"
									className="annual-plan-upgrade-upsell__checklist-item-icon"
								/>
								<span className="annual-plan-upgrade-upsell__checklist-item-text">
									A free custom domain for one year: any available domain you like, free for a year.
								</span>
							</li>
							<li className="annual-plan-upgrade-upsell__checklist-item">
								<Gridicon
									icon="checkmark"
									className="annual-plan-upgrade-upsell__checklist-item-icon"
								/>
								<span className="annual-plan-upgrade-upsell__checklist-item-text">
									Your own personalized email address free for three months.
								</span>
							</li>
							{ annualPlanSlug !== 'personal' && (
								<li className="annual-plan-upgrade-upsell__checklist-item">
									<Gridicon
										icon="checkmark"
										className="annual-plan-upgrade-upsell__checklist-item-icon"
									/>
									<span className="annual-plan-upgrade-upsell__checklist-item-text">
										Live chat support: Get unlimited live chat support any time of the day with our
										expert Happiness Engineers.
									</span>
								</li>
							) }
						</ul>
						<p>Click below to upgrade your plan to an annual one and enjoy your benefits.</p>
					</div>
					<div className="annual-plan-upgrade-upsell__column-doodle">
						<img
							className="annual-plan-upgrade-upsell__doodle"
							alt="Website expert offering a support session"
							src={ premiumThemesImage }
						/>
					</div>
				</div>
			</>
		);
	}

	footer() {
		const { handleClickAccept, handleClickDecline } = this.props;
		return (
			<footer className="annual-plan-upgrade-upsell__footer">
				<Button
					data-e2e-button="decline"
					className="annual-plan-upgrade-upsell__decline-offer-button"
					onClick={ handleClickDecline }
				>
					No thanks
				</Button>
				<Button
					primary
					className="annual-plan-upgrade-upsell__accept-offer-button"
					onClick={ () => handleClickAccept( 'accept' ) }
				>
					Upgrade and enjoy these benefits!
				</Button>
			</footer>
		);
	}
}
