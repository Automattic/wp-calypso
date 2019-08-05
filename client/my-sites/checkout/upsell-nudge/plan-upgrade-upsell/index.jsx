/** @format */

/**
 * External dependencies
 */
import React, { PureComponent } from 'react';
import Gridicon from 'gridicons';
import formatCurrency from '@automattic/format-currency';

/**
 * Internal dependencies
 */
import CompactCard from 'components/card/compact';
import Button from 'components/button';
import DocumentHead from 'components/data/document-head';
import PageViewTracker from 'lib/analytics/page-view-tracker';

/**
 * Style dependencies
 */
import './style.scss';

/**
 * Image dependencies
 */
import premiumThemesImage from 'assets/images/illustrations/themes.svg';

export class PlanUpgradeUpsell extends PureComponent {
	render() {
		const { receiptId, translate } = this.props;

		const title = translate( 'Checkout ‹ Plan Upgrade', {
			comment: '"Checkout" is the part of the site where a user is preparing to make a purchase.',
		} );

		return (
			<>
				<PageViewTracker path="/checkout/:site/plan-upgrade-nudge/:receipt_id" title={ title } />
				<DocumentHead title={ title } />
				{ receiptId ? (
					<CompactCard className="plan-upgrade-upsell__card-header">{ this.header() }</CompactCard>
				) : (
					''
				) }
				<CompactCard className="plan-upgrade-upsell__card-body">{ this.body() }</CompactCard>
				<CompactCard className="plan-upgrade-upsell__card-footer">{ this.footer() }</CompactCard>
			</>
		);
	}

	header() {
		const { translate } = this.props;

		return (
			<header className="plan-upgrade-upsell__small-header">
				<h2 className="plan-upgrade-upsell__title">
					{ translate( 'Hold tight, your site is being upgraded.' ) }
				</h2>
			</header>
		);
	}

	body() {
		const { translate, planRawPrice, planDiscountedRawPrice, currencyCode } = this.props;
		const bundleValue = planRawPrice * 77;
		const premiumThemePriceLow = planDiscountedRawPrice * 1.37;
		const premiumThemePriceHigh = planDiscountedRawPrice * 2.75;
		return (
			<>
				<h2 className="plan-upgrade-upsell__header">
					{ translate(
						'Add {{u}}%(bundleValue)s worth{{/u}} of Premium Designs to your order {{br/}}{{u}}for just %(discountPrice)s more{{/u}}!',
						{
							args: {
								bundleValue: formatCurrency( bundleValue, currencyCode, { precision: 0 } ),
								discountPrice: formatCurrency( planDiscountedRawPrice, currencyCode, {
									precision: 0,
								} ),
							},
							components: { u: <u />, br: <br /> },
						}
					) }
				</h2>

				<div className="plan-upgrade-upsell__column-pane">
					<div className="plan-upgrade-upsell__column-content">
						<p>
							<b>
								{ translate(
									'According to Google, design is possibly the best investment you can make for your website.'
								) }
							</b>
						</p>
						<p>
							{ translate(
								'Why? Based on their research, 50% of the people visiting your site decide to leave or stay within the first three seconds.'
							) }
						</p>
						<p>
							{ translate( '{{i}}Three seconds!{{/i}}', {
								components: { i: <i /> },
							} ) }
						</p>
						<p>
							{ translate(
								"Wouldn't you like to make a great first impression in those three seconds?"
							) }
						</p>
						<p>{ translate( "Thankfully, there's a way." ) }</p>
						<p>
							{ translate(
								'Great looking sites {{b}}always{{/b}} create great first impressions and leave people wanting to know more about you.',
								{
									components: { b: <b /> },
								}
							) }
						</p>
						<p>
							{ translate(
								"That's exactly why we've partnered with some of the world's greatest designers to offer nearly 200 high-end designs that you can use to make your site looks incredible."
							) }
						</p>
						<p>
							{ translate(
								'These premium themes are beautiful and optimized for mobile and search engines. Most importantly, they are ready to use regardless of your goals.'
							) }
						</p>
						<p>
							{ translate(
								"From small businesses to blogs, wedding sites to designer portfolios, you'll find the perfect theme for your needs."
							) }
						</p>
						<p>
							{ translate(
								'Normally, each of these WordPress themes {{b}}cost between %(premiumThemePriceLow)s and %(premiumThemePriceHigh)s or more{{/b}}.',
								{
									args: {
										premiumThemePriceLow: formatCurrency( premiumThemePriceLow, currencyCode, {
											precision: 0,
										} ),
										premiumThemePriceHigh: formatCurrency( premiumThemePriceHigh, currencyCode, {
											precision: 0,
										} ),
									},
									components: { b: <b /> },
								}
							) }
						</p>
						<p>
							{ translate(
								'But if you upgrade to a Premium plan with this special offer, you can enjoy the full collection of premium themes for just an additional %(discountPrice)s!',
								{
									args: {
										discountPrice: formatCurrency( planDiscountedRawPrice, currencyCode ),
									},
								}
							) }
						</p>
						<p>
							{ translate(
								"You'll also gain access to some of the most powerful features on WordPress.com:"
							) }
						</p>

						<ul className="plan-upgrade-upsell__checklist">
							<li className="plan-upgrade-upsell__checklist-item">
								<Gridicon icon="checkmark" className="plan-upgrade-upsell__checklist-item-icon" />
								<span className="plan-upgrade-upsell__checklist-item-text">
									{ translate(
										'{{b}}More ways to monetize your site.{{/b}} You can sell stuff on your site without any hassle. Or earn through our special advertising program. Or why not both?',
										{
											components: { b: <b /> },
											comment: "This is a benefit listed on a 'Upgrade your plan' page",
										}
									) }
								</span>
							</li>
							<li className="plan-upgrade-upsell__checklist-item">
								<Gridicon icon="checkmark" className="plan-upgrade-upsell__checklist-item-icon" />
								<span className="plan-upgrade-upsell__checklist-item-text">
									{ translate(
										'{{b}}Advanced tools to become a social media pro.{{/b}} Schedule posts in advance, resurface your older content, to scheduling multiple social posts at a time.',
										{
											components: { b: <b /> },
											comment: "This is a benefit listed on a 'Upgrade your plan' page",
										}
									) }
								</span>
							</li>
							<li className="plan-upgrade-upsell__checklist-item">
								<Gridicon icon="checkmark" className="plan-upgrade-upsell__checklist-item-icon" />
								<span className="plan-upgrade-upsell__checklist-item-text">
									{ translate(
										'{{b}}Customize your premium theme to your exact needs.{{/b}} With advanced design features, you can make your site stand and never be the same as others.',
										{
											components: { b: <b /> },
											comment: "This is a benefit listed on a 'Upgrade your plan' page",
										}
									) }
								</span>
							</li>
						</ul>

						<p>
							{ translate(
								'Give the Premium plan a risk-free test drive with our {{u}}30-day Money Back Guarantee{{/u}}.',
								{
									components: { u: <u /> },
								}
							) }
						</p>
						<p>
							<b>
								{ translate(
									'Upgrade to the Premium plan (and access nearly 200 premium themes) for just {{del}}%(fullPrice)s{{/del}} %(discountPrice)s more.',
									{
										components: { del: <del /> },
										args: {
											bundleValue: formatCurrency( bundleValue, currencyCode, { precision: 0 } ),
											fullPrice: formatCurrency( planRawPrice, currencyCode ),
											discountPrice: formatCurrency( planDiscountedRawPrice, currencyCode ),
										},
									}
								) }
							</b>
						</p>
					</div>
					<div className="plan-upgrade-upsell__column-doodle">
						<img
							className="plan-upgrade-upsell__doodle"
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
			<footer className="plan-upgrade-upsell__footer">
				<Button
					className="plan-upgrade-upsell__decline-offer-button"
					onClick={ handleClickDecline }
				>
					{ translate( "No thanks, I'll stick with the free themes" ) }
				</Button>
				<Button
					primary
					className="plan-upgrade-upsell__accept-offer-button"
					onClick={ () => handleClickAccept( 'accept' ) }
				>
					{ translate( "Yes, I'd love to try those Premium designs!" ) }
				</Button>
			</footer>
		);
	}
}
