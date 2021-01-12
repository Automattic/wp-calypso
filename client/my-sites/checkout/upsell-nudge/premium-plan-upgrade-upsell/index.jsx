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
					{ translate( "Hold tight, we're getting your site ready." ) }
				</h2>
			</header>
		);
	}

	body() {
		const { translate, planRawPrice, planDiscountedRawPrice, currencyCode } = this.props;
		return (
			<>
				<h2 className="premium-plan-upgrade-upsell__header">
					{ translate( 'Upgrade now and get {{br/}} instant expert help to build your site', {
						components: { br: <br /> },
					} ) }
				</h2>

				<div className="premium-plan-upgrade-upsell__column-pane">
					<div className="premium-plan-upgrade-upsell__column-content">
						<p>
							{ translate(
								'Imagine being able to pick up the phone and call your website expert friend to ask any question you have when building your site.'
							) }
						</p>
						<p>
							<em>
								{ translate(
									'Hey, I want to change this thing here… but I don’t know where or how to do it!'
								) }
							</em>
						</p>
						<p>
							{ translate(
								'Now imagine you can text your friend day or night, no matter the time, and they will always have an answer for you, cheering you on and rooting for your success.'
							) }
						</p>
						<p>
							{ translate(
								'That’s exactly what you’ll get when you upgrade to the Premium plan:'
							) }
						</p>
						<p>
							{ translate(
								'{{strong}}Instant help to build your site, just a click away.{{/strong}}',
								{
									components: { strong: <strong /> },
								}
							) }
						</p>
						<p>
							{ translate(
								'With our world-class Live Chat support you’ll be in touch with a real human usually within three minutes. No annoying menu to fight through when you want help.'
							) }
						</p>
						<p>
							{ translate(
								'With expert help steering you in the right direction, imagine how quick you’ll get things done!'
							) }
						</p>
						<p>
							{ translate(
								'The Premium plan will also get you access to some of the most powerful features on WordPress.com:'
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
										'{{strong}}Instant access to the world’s largest group of WordPress experts{{/strong}}. Our Happiness Engineers are available one click away, 24 hours-a-day, five days per week.',
										{
											components: { strong: <strong /> },
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
										'{{strong}}More ways to earn money with your site{{/strong}}. With WordPress.com Payments you can sell things on your site without any hassle and / or earn through our special advertising program.',
										{
											components: { strong: <strong /> },
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
										'{{strong}}Advanced social media tools{{/strong}}. Schedule posts in advance, resurface your older content, or schedule multiple social posts at a time.',
										{
											components: { strong: <strong /> },
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
										'{{strong}}Unlimited premium designs{{/strong}}. Create a website that’s all you and helps your brand stand out.',
										{
											components: { strong: <strong /> },
											comment: "This is a benefit listed on a 'Upgrade your plan' page",
										}
									) }
								</span>
							</li>
						</ul>
						<p>
							{ translate(
								'Try Premium risk-free with our {{strong}}14-day money-back guarantee{{/strong}}. If you don’t love it, you can return to the Personal Plan.',
								{
									components: { strong: <strong /> },
								}
							) }
						</p>
						<p>
							<strong>
								{ translate(
									'Upgrade now to the Premium plan (and get instant live chat access to our trusted WordPress.com experts) for just {{del}}%(fullPrice)s{{/del}} %(discountPrice)s more.',
									{
										components: {
											del: <del />,
										},
										args: {
											fullPrice: formatCurrency( planRawPrice, currencyCode, { stripZeros: true } ),
											discountPrice: formatCurrency( planDiscountedRawPrice, currencyCode, {
												stripZeros: true,
											} ),
										},
									}
								) }
							</strong>
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
					data-e2e-button="decline"
					className="premium-plan-upgrade-upsell__decline-offer-button"
					onClick={ handleClickDecline }
				>
					{ translate( 'No thanks' ) }
				</Button>
				<Button
					primary
					className="premium-plan-upgrade-upsell__accept-offer-button"
					onClick={ () => handleClickAccept( 'accept' ) }
				>
					{ translate( 'Yes, I want to get instant help when needed' ) }
				</Button>
			</footer>
		);
	}
}
