import { PLAN_BUSINESS, PLAN_PREMIUM, getPlan } from '@automattic/calypso-products';
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
				<div className="business-plan-upgrade-upsell-new-design__container">
					<div className="business-plan-upgrade-upsell-new-design__header">
						{ receiptId ? this.header() : '' }
						<div className="business-plan-upgrade-upsell-new-design__header-title">
							{ this.title() }
						</div>
					</div>
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
		return null;
	}

	image() {
		return (
			<img
				className="business-plan-upgrade-upsell-new-design__image"
				src={ upsellImage }
				alt=""
				width="320"
			/>
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
			isLoading,
		} = this.props;
		return (
			<>
				<div className="business-plan-upgrade-upsell-new-design__column-pane">
					<p>
						<b>
							{
								/* translators: %(planName)s is the short-hand version of the Business plan name */
								translate( 'Unlock the power of the %(planName)s Plan and gain access to:', {
									args: { planName: getPlan( PLAN_BUSINESS )?.getTitle() ?? '' },
								} )
							}
						</b>
					</p>
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
						{
							/* translators: %(planName)s is the short-hand version of the Business plan name */
							translate(
								'The great news is that you can upgrade today and try the %(planName)s Plan risk-free thanks to our {{b}}%(days)d-day money-back guarantee{{/b}}.',
								{
									components: {
										b: <b />,
									},
									args: {
										days: hasSevenDayRefundPeriod ? 7 : 14,
										planName: getPlan( PLAN_BUSINESS )?.getTitle() ?? '',
										comment: 'A number, e.g. 7-day money-back guarantee',
									},
								}
							)
						}
					</p>
					<p>
						{ translate(
							'Simply click below to upgrade. You’ll only have to pay the difference to the %(planName)s Plan {{PriceWrapper}}({{del}}%(fullPrice)s{{/del}} %(discountPrice)s).{{/PriceWrapper}}',
							{
								components: {
									del: <del />,
									PriceWrapper: (
										<span className={ isLoading ? 'upsell-nudge__small-placeholder' : '' } />
									),
								},
								args: {
									fullPrice: formatCurrency( planRawPrice, currencyCode, {
										stripZeros: true,
										isSmallestUnit: true,
									} ),
									discountPrice: formatCurrency( planDiscountedRawPrice, currencyCode, {
										stripZeros: true,
										isSmallestUnit: true,
									} ),
									planName: getPlan( PLAN_PREMIUM )?.getTitle() ?? '',
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
		const { translate, handleClickAccept, handleClickDecline, isLoading } = this.props;
		return (
			<footer>
				<Button
					primary
					className="business-plan-upgrade-upsell-new-design__accept-offer-button"
					busy={ isLoading }
					onClick={ () => handleClickAccept( 'accept' ) }
				>
					{ isLoading ? translate( 'Loading' ) : translate( 'Upgrade Now' ) }
				</Button>
				<Button
					data-e2e-button="decline"
					className="business-plan-upgrade-upsell-new-design__decline-offer-button"
					onClick={ handleClickDecline }
				>
					{ translate( 'No Thanks' ) }
				</Button>
			</footer>
		);
	}
}
