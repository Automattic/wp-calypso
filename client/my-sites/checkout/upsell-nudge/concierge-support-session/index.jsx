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

export class ConciergeSupportSession extends PureComponent {
	render() {
		const { receiptId, translate } = this.props;

		const title = translate( 'Checkout ‹ Support Session', {
			comment: '"Checkout" is the part of the site where a user is preparing to make a purchase.',
		} );

		const pageViewTrackerPath = receiptId
			? '/checkout/offer-support-session/:receipt_id/:site'
			: '/checkout/offer-support-session/:site';

		return (
			<>
				<PageViewTracker path={ pageViewTrackerPath } title={ title } />
				<DocumentHead title={ title } />
				{ receiptId ? (
					<CompactCard className="concierge-support-session__card-header">
						{ this.header() }
					</CompactCard>
				) : (
					''
				) }
				<CompactCard className="concierge-support-session__card-body">{ this.body() }</CompactCard>
				<CompactCard className="concierge-support-session__card-footer">
					{ this.footer() }
				</CompactCard>
			</>
		);
	}

	header() {
		const { translate } = this.props;

		return (
			<header className="concierge-support-session__header">
				<h2 className="concierge-support-session__title">
					{ translate( 'Hold tight, your site is being upgraded.' ) }
				</h2>
			</header>
		);
	}

	body() {
		const { translate, productCost, productDisplayCost, currencyCode } = this.props;
		// Full cost should be 150% of base cost
		const fullCost = Math.round( productCost * 1.5 );
		const savings = fullCost - productCost;
		return (
			<>
				<div className="concierge-support-session__column-pane">
					<div className="concierge-support-session__column-content">
						<h4 className="concierge-support-session__sub-header">
							{ translate( 'Do you need some help building your site?' ) }
						</h4>

						<p>
							<b>
								{ translate(
									'Reserve a %(durationInMinutes)d-minute one-on-one call with a website expert to help you get started on the right foot.',
									{
										args: { durationInMinutes: 30 },
									}
								) }
							</b>
						</p>

						<p>{ translate( 'What our team of experts can help you with:' ) }</p>

						<ul className="concierge-support-session__checklist">
							<li className="concierge-support-session__checklist-item">
								<Gridicon
									icon="checkmark"
									className="concierge-support-session__checklist-item-icon"
								/>
								<span className="concierge-support-session__checklist-item-text">
									{ translate( '{{b}}Design:{{/b}} Which template to choose.', {
										components: { b: <b /> },
										comment: "This is a benefit listed on a 'Purchase a call with us' page",
									} ) }
								</span>
							</li>
							<li className="concierge-support-session__checklist-item">
								<Gridicon
									icon="checkmark"
									className="concierge-support-session__checklist-item-icon"
								/>
								<span className="concierge-support-session__checklist-item-text">
									{ translate(
										'{{b}}Traffic:{{/b}} How to make your site search-engine friendly.',
										{
											components: { b: <b /> },
											comment: "This is a benefit listed on a 'Purchase a call with us' page",
										}
									) }
								</span>
							</li>
							<li className="concierge-support-session__checklist-item">
								<Gridicon
									icon="checkmark"
									className="concierge-support-session__checklist-item-icon"
								/>
								<span className="concierge-support-session__checklist-item-text">
									{ translate(
										"{{b}}Site building tools:{{/b}} Learn how to create a site you're proud to share.",
										{
											components: { b: <b /> },
											comment: "This is a benefit listed on a 'Purchase a call with us' page",
										}
									) }
								</span>
							</li>
							<li className="concierge-support-session__checklist-item">
								<Gridicon
									icon="checkmark"
									className="concierge-support-session__checklist-item-icon"
								/>
								<span className="concierge-support-session__checklist-item-text">
									{ translate(
										'{{b}}Content:{{/b}} What information to include and where it should go.',
										{
											components: { b: <b /> },
											comment: "This is a benefit listed on a 'Purchase a call with us' page",
										}
									) }
								</span>
							</li>
							<li className="concierge-support-session__checklist-item">
								<Gridicon
									icon="checkmark"
									className="concierge-support-session__checklist-item-icon"
								/>
								<span className="concierge-support-session__checklist-item-text">
									{ translate( "{{b}}And more:{{/b}} Tell our experts what you'd like to cover.", {
										components: { b: <b /> },
										comment: "This is a benefit listed on a 'Purchase a call with us' page",
									} ) }
								</span>
							</li>
						</ul>

						<h4 className="concierge-support-session__sub-header">
							{ translate(
								'Reserve a %(durationInMinutes)d-minute "Quick Start" appointment, and save %(saveAmount)s if you sign up today.',
								{
									args: {
										saveAmount: formatCurrency( savings, currencyCode, { stripZeros: true } ),
										durationInMinutes: 30,
									},
								}
							) }
						</h4>

						<p>
							<b>
								{ translate(
									'Book your call today for just {{del}}%(oldPrice)s{{/del}} %(price)s.',
									{
										components: { del: <del /> },
										args: {
											oldPrice: formatCurrency( fullCost, currencyCode, { stripZeros: true } ),
											price: productDisplayCost,
										},
									}
								) }
							</b>{ ' ' }
							{ translate(
								'Click the button below to confirm your purchase (sessions are currently limited to English language support).'
							) }
						</p>
					</div>
					<div className="concierge-support-session__column-doodle">
						<img
							className="concierge-support-session__doodle"
							alt="Website expert offering a support session"
							src="/calypso/images/illustrations/support.svg"
						/>
					</div>
				</div>
			</>
		);
	}

	footer() {
		const { translate, productDisplayCost, handleClickAccept, handleClickDecline } = this.props;
		return (
			<footer className="concierge-support-session__footer">
				<Button
					data-e2e-button="decline"
					className="concierge-support-session__decline-offer-button"
					onClick={ handleClickDecline }
				>
					{ translate( 'Skip' ) }
				</Button>
				<Button
					primary
					className="concierge-support-session__accept-offer-button"
					onClick={ () => handleClickAccept( 'accept' ) }
				>
					{ translate( 'Reserve a call for %(amount)s', {
						args: {
							amount: productDisplayCost,
						},
					} ) }
				</Button>
			</footer>
		);
	}
}
