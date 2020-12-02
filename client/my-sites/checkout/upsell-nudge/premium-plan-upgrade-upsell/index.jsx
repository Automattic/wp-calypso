/**
 * External dependencies
 */
import React, { PureComponent } from 'react';
import Gridicon from 'calypso/components/gridicon';
import formatCurrency from '@automattic/format-currency';

/**
 * Internal dependencies
 */
import { CompactCard, Button } from '@automattic/components';
import DocumentHead from 'calypso/components/data/document-head';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';

/**
 * Style dependencies
 */
import './style.scss';

/**
 * Image dependencies
 */
import premiumThemesImage from 'calypso/assets/images/illustrations/themes.svg';

export class PremiumPlanUpgradeUpsell extends PureComponent {
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
					properties={ { upgrade_item: 'premium' } }
				/>
				<DocumentHead title={ title } />
				{ receiptId ? (
					<CompactCard className="premium-plan-upgrade-upsell__card-header">
						{ this.header() }
					</CompactCard>
				) : (
					''
				) }
				<CompactCard className="premium-plan-upgrade-upsell__card-body">
					{ this.body() }
				</CompactCard>
				<CompactCard className="premium-plan-upgrade-upsell__card-footer">
					{ this.footer() }
				</CompactCard>
			</>
		);
	}

	header() {
		const { translate } = this.props;

		return (
			<header className="premium-plan-upgrade-upsell__small-header">
				<h2 className="premium-plan-upgrade-upsell__title">
					{ translate( 'This is a one time offer just for you' ) }
				</h2>
			</header>
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
				<h2 className="premium-plan-upgrade-upsell__header">
					{ translate( 'Get access to Premium designs with this special offer', {
						components: { br: <br /> },
					} ) }
				</h2>

				<div className="premium-plan-upgrade-upsell__column-pane">
					<div className="premium-plan-upgrade-upsell__column-content">
						<p>
							<b>
								{ translate(
									'According to Google, design is possibly the best investment you can make for your website.'
								) }
							</b>
						</p>
						<p>
							{ translate(
								"Wouldn't you like to make a great first impression in those three seconds?"
							) }
						</p>
						<p>
							{ translate(
								'That’s exactly why we’ve partnered with some of the world’s greatest designers to offer nearly 200 high-end designs that you can use to make your site looks incredible.'
							) }
						</p>
						<p>
							{ translate(
								'You’ll also gain access to some of the most powerful features on WordPress.com:'
							) }
						</p>
						<ul className="premium-plan-upgrade-upsell__checklist">
							<li className="premium-plan-upgrade-upsell__checklist-item">
								<Gridicon
									icon="checkmark"
									className="premium-plan-upgrade-upsell__checklist-item-icon"
								/>
								<span className="premium-plan-upgrade-upsell__checklist-item-text">
									{ translate(
										'More ways to monetize your site. You can sell stuff on your site without any hassle. Or earn through our special advertising program. Or why not both?',
										{
											comment: "This is a benefit listed on a 'Upgrade your plan' page",
										}
									) }
								</span>
							</li>
							<li className="premium-plan-upgrade-upsell__checklist-item">
								<Gridicon
									icon="checkmark"
									className="premium-plan-upgrade-upsell__checklist-item-icon"
								/>
								<span className="premium-plan-upgrade-upsell__checklist-item-text">
									{ translate(
										'Advanced tools to become a social media pro. Schedule posts in advance, resurface your older content, to scheduling multiple social posts at a time.',
										{
											comment: "This is a benefit listed on a 'Upgrade your plan' page",
										}
									) }
								</span>
							</li>
							<li className="premium-plan-upgrade-upsell__checklist-item">
								<Gridicon
									icon="checkmark"
									className="premium-plan-upgrade-upsell__checklist-item-icon"
								/>
								<span className="premium-plan-upgrade-upsell__checklist-item-text">
									{ translate(
										'Customize your premium theme to your exact needs. With advanced design features, you can create a bespoke site that channels your brand.',
										{
											comment: "This is a benefit listed on a 'Upgrade your plan' page",
										}
									) }
								</span>
							</li>
						</ul>
						<p>
							{ hasSevenDayRefundPeriod && // @todo - Remove the duplicate translations once the new string is translated
								translate(
									'Give the Premium plan a risk-free test drive with our {{b}}%(days)d-day money-back guarantee{{/b}}.',
									{
										args: { days: 7 },
										components: { b: <b /> },
									}
								) }
							{ ! hasSevenDayRefundPeriod &&
								translate(
									'Give the Premium plan a risk-free test drive with our {{b}}30-day money-back guarantee{{/b}}.',
									{
										components: { b: <b /> },
									}
								) }
						</p>
						<p>
							{ hasSevenDayRefundPeriod &&
								translate(
									'Simply click the link below and select the Premium plan option to upgrade today {{b}}for just {{del}}%(fullPrice)s{{/del}} %(discountPrice)s more{{/b}}. Once you upgrade, you’ll have %(days)d days to evaluate the plan and decide if it’s right for you.',
									{
										components: {
											del: <del />,
											b: <b />,
										},
										args: {
											days: 7,
											fullPrice: formatCurrency( planRawPrice, currencyCode, { stripZeros: true } ),
											discountPrice: formatCurrency( planDiscountedRawPrice, currencyCode, {
												stripZeros: true,
											} ),
										},
									}
								) }
							{ ! hasSevenDayRefundPeriod &&
								translate(
									'Simply click the link below and select the Premium plan option to upgrade today {{b}}for just {{del}}%(fullPrice)s{{/del}} %(discountPrice)s more{{/b}}. Once you upgrade, you’ll have 30 days to evaluate the plan and decide if it’s right for you.',
									{
										components: {
											del: <del />,
											b: <b />,
										},
										args: {
											fullPrice: formatCurrency( planRawPrice, currencyCode, { stripZeros: true } ),
											discountPrice: formatCurrency( planDiscountedRawPrice, currencyCode, {
												stripZeros: true,
											} ),
										},
									}
								) }
						</p>
						<p>
							{ translate(
								'Are you ready to get started? Go for it now -- this one-time offer will be gone once you leave this screen.'
							) }
						</p>
					</div>
					<div className="premium-plan-upgrade-upsell__column-doodle">
						<img
							className="premium-plan-upgrade-upsell__doodle"
							alt="Website expert offering a support session"
							src={ premiumThemesImage }
						/>
					</div>
				</div>
			</>
		);
	}

	footer() {
		const { translate, handleClickAccept, handleClickDecline } = this.props;
		return (
			<footer className="premium-plan-upgrade-upsell__footer">
				<Button
					className="premium-plan-upgrade-upsell__decline-offer-button"
					onClick={ handleClickDecline }
				>
					{ translate( 'No thanks, I’ll stick with the free themes' ) }
				</Button>
				<Button
					primary
					className="premium-plan-upgrade-upsell__accept-offer-button"
					onClick={ () => handleClickAccept( 'accept' ) }
				>
					{ translate( 'Yes, I’d love to try those Premium designs!' ) }
				</Button>
			</footer>
		);
	}
}
