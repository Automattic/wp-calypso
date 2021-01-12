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
				{ receiptId ? (
					<CompactCard className="business-plan-upgrade-upsell__card-header">
						{ this.header() }
					</CompactCard>
				) : (
					''
				) }
				<CompactCard className="business-plan-upgrade-upsell__card-body">
					{ this.body() }
				</CompactCard>
				<CompactCard className="business-plan-upgrade-upsell__card-footer">
					{ this.footer() }
				</CompactCard>
			</>
		);
	}

	header() {
		const { translate } = this.props;

		return (
			<header className="business-plan-upgrade-upsell__small-header">
				<h2 className="business-plan-upgrade-upsell__title">
					{ translate( "Hold tight, we're getting your site ready." ) }
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
				<h2 className="business-plan-upgrade-upsell__header">
					{ translate( 'Upgrade your account to our most powerful plan ever' ) }
				</h2>

				<div className="business-plan-upgrade-upsell__column-pane">
					<div className="business-plan-upgrade-upsell__column-content">
						<p>
							<b>
								{ translate(
									'Did you know that WordPress.com Business plan customers can now upload any WordPress plugins they want?'
								) }
							</b>
						</p>
						<p>
							{ translate(
								'If you’re familiar with WordPress plugins, you know why that’s exciting. Installing plugins on your site is like downloading an app on your phone. Except, instead of getting a new game or productivity tool, you get new features and functionality for your site.'
							) }
						</p>
						<p>
							{ translate(
								'There are more than 50,000 WordPress plugins available to help turn your site into any powerful platform you imagine.'
							) }
						</p>
						<p>{ translate( 'With the power of plugins you can:' ) }</p>
						<ul className="business-plan-upgrade-upsell__checklist">
							<li className="business-plan-upgrade-upsell__checklist-item">
								<Gridicon
									icon="checkmark"
									className="business-plan-upgrade-upsell__checklist-item-icon"
								/>
								<span className="business-plan-upgrade-upsell__checklist-item-text">
									{ translate(
										'Transform your site into a mobile app, a job board, a wiki, or a coupon site.',
										{
											comment: "This is a benefit listed on a 'Upgrade your plan' page",
										}
									) }
								</span>
							</li>
							<li className="business-plan-upgrade-upsell__checklist-item">
								<Gridicon
									icon="checkmark"
									className="business-plan-upgrade-upsell__checklist-item-icon"
								/>
								<span className="business-plan-upgrade-upsell__checklist-item-text">
									{ translate( 'Create a private, customer-only section.', {
										comment: "This is a benefit listed on a 'Upgrade your plan' page",
									} ) }
								</span>
							</li>
							<li className="business-plan-upgrade-upsell__checklist-item">
								<Gridicon
									icon="checkmark"
									className="business-plan-upgrade-upsell__checklist-item-icon"
								/>
								<span className="business-plan-upgrade-upsell__checklist-item-text">
									{ translate( 'Let your customers book and pay for appointments by themselves.', {
										comment: "This is a benefit listed on a 'Upgrade your plan' page",
									} ) }
								</span>
							</li>
							<li className="business-plan-upgrade-upsell__checklist-item">
								<Gridicon
									icon="checkmark"
									className="business-plan-upgrade-upsell__checklist-item-icon"
								/>
								<span className="business-plan-upgrade-upsell__checklist-item-text">
									{ translate(
										'Fully optimize your site for search engines with advanced options.',
										{
											comment: "This is a benefit listed on a 'Upgrade your plan' page",
										}
									) }
								</span>
							</li>
							<li className="business-plan-upgrade-upsell__checklist-item">
								<Gridicon
									icon="checkmark"
									className="business-plan-upgrade-upsell__checklist-item-icon"
								/>
								<span className="business-plan-upgrade-upsell__checklist-item-text">
									{ translate(
										'Build a professional photography site with beautiful photo galleries.',
										{
											comment: "This is a benefit listed on a 'Upgrade your plan' page",
										}
									) }
								</span>
							</li>
							<li className="business-plan-upgrade-upsell__checklist-item">
								<Gridicon
									icon="checkmark"
									className="business-plan-upgrade-upsell__checklist-item-icon"
								/>
								<span className="business-plan-upgrade-upsell__checklist-item-text">
									{ translate( 'Turn your site into a lead-generation powerhouse.', {
										comment: "This is a benefit listed on a 'Upgrade your plan' page",
									} ) }
								</span>
							</li>
							<li className="business-plan-upgrade-upsell__checklist-item">
								<Gridicon
									icon="checkmark"
									className="business-plan-upgrade-upsell__checklist-item-icon"
								/>
								<span className="business-plan-upgrade-upsell__checklist-item-text">
									{ translate( 'Grow your email list with opt-in forms on your site.', {
										comment: "This is a benefit listed on a 'Upgrade your plan' page",
									} ) }
								</span>
							</li>
						</ul>
						<p>
							{ translate(
								'And access to the plugin library is just one of many benefits included with the Business plan.'
							) }
						</p>
						<p>
							{ translate(
								'With our Business plan you can upload any custom theme you want, have full access to your site with SFTP, and have full control of your data directly with phpMyAdmin.'
							) }
						</p>
						<p>
							{ translate(
								'You’ll also get automated backups and one-click rewind for your site. Those powerful tools mean you’ll never need to worry about losing data, or breaking your site during updates.'
							) }
						</p>
						<p>
							{ translate(
								'{{b}}But please note:{{/b}} you don’t currently have access to all these amazing features because they are only available to Business plan customers and you haven’t upgraded yet.',
								{
									components: { b: <b /> },
								}
							) }
						</p>
						<p>
							{ hasSevenDayRefundPeriod && // @todo - Remove the duplicate translations once the new string is translated
								translate(
									'The good news is that you can upgrade your plan today and try the Business plan risk-free thanks to our {{b}}%(days)d-day money-back guarantee{{/b}}.',
									{
										args: { days: 7 },
										components: { b: <b /> },
									}
								) }
							{ ! hasSevenDayRefundPeriod &&
								translate(
									'The good news is that you can upgrade your plan today and try the Business plan risk-free thanks to our {{b}}30-day money-back guarantee{{/b}}.',
									{
										components: { b: <b /> },
									}
								) }
						</p>
						<p>
							{ hasSevenDayRefundPeriod &&
								translate(
									'Simply click the link below and select the Business plan option to upgrade today {{b}}for just {{del}}%(fullPrice)s{{/del}} %(discountPrice)s more{{/b}}. Once you upgrade, you’ll have %(days)d days to evaluate the plan and decide if it’s right for you.',
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
									'Simply click the link below and select the Business plan option to upgrade today {{b}}for just {{del}}%(fullPrice)s{{/del}} %(discountPrice)s more{{/b}}. Once you upgrade, you’ll have 30 days to evaluate the plan and decide if it’s right for you.',
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
						<p>{ translate( 'So are you ready to explore our most powerful plan ever?' ) }</p>
					</div>
					<div className="business-plan-upgrade-upsell__column-doodle">
						<img
							className="business-plan-upgrade-upsell__doodle"
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
			<footer className="business-plan-upgrade-upsell__footer">
				<Button
					data-e2e-button="decline"
					className="business-plan-upgrade-upsell__decline-offer-button"
					onClick={ handleClickDecline }
				>
					{ translate( "No thanks, I don't need plugins" ) }
				</Button>
				<Button
					primary
					className="business-plan-upgrade-upsell__accept-offer-button"
					onClick={ () => handleClickAccept( 'accept' ) }
				>
					{ translate( 'Yes, I need plugins for my site!' ) }
				</Button>
			</footer>
		);
	}
}
