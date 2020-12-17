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

export class ConciergeQuickstartSession extends PureComponent {
	render() {
		const { receiptId, translate, siteSlug, isLoggedIn } = this.props;

		const title = translate( 'Checkout ‹ Quick Start Session', {
			comment: '"Checkout" is the part of the site where a user is preparing to make a purchase.',
		} );

		let pageViewTrackerPath;
		if ( receiptId ) {
			pageViewTrackerPath = '/checkout/offer-quickstart-session/:receipt_id/:site';
		} else if ( siteSlug ) {
			pageViewTrackerPath = '/checkout/offer-quickstart-session/:site';
		} else {
			pageViewTrackerPath = '/checkout/offer-quickstart-session';
		}

		return (
			<>
				<PageViewTracker
					path={ pageViewTrackerPath }
					title={ title }
					properties={ { is_logged_in: isLoggedIn } }
				/>
				<DocumentHead title={ title } />
				{ receiptId ? (
					<CompactCard className="concierge-quickstart-session__card-header">
						{ this.header() }
					</CompactCard>
				) : (
					''
				) }
				<CompactCard className="concierge-quickstart-session__card-body">
					{ this.body() }
				</CompactCard>
				<CompactCard className="concierge-quickstart-session__card-footer">
					{ this.footer() }
				</CompactCard>
			</>
		);
	}

	header() {
		const { translate } = this.props;

		return (
			<header className="concierge-quickstart-session__header">
				<h2 className="concierge-quickstart-session__title">
					{ translate( 'Hold tight, your site is being upgraded.' ) }
				</h2>
			</header>
		);
	}

	body() {
		const { translate, productCost, productDisplayCost, currencyCode, receiptId } = this.props;
		const fullCost = Math.round( productCost * 2.021 );
		return (
			<>
				<h4 className="concierge-quickstart-session__sub-header">
					{ translate( 'Presenting… a personal WordPress Expert, by your side' ) }
				</h4>
				<div className="concierge-quickstart-session__column-pane">
					<div className="concierge-quickstart-session__column-content">
						<p>
							{ translate(
								"What if you could sit with a true expert, someone who's helped hundreds of people succeed online, and get their advice to build a great site… in less time than you ever thought possible?"
							) }
						</p>
						<p>
							<b>
								{ translate( 'Introducing WordPress.com {{em}}Quick Start{{/em}} Sessions.', {
									components: { em: <em /> },
								} ) }
							</b>
						</p>
						<p>
							{ translate(
								"{{em}}Quick Start{{/em}} sessions are %(durationInMinutes)d-minute one-on-one conversations between you and one of our website building experts. They know WordPress inside out and will help you achieve your goals with a smile. That's why we call them Happiness Engineers.",
								{
									components: { em: <em /> },
									args: { durationInMinutes: 30 },
								}
							) }
						</p>
						<p>
							{ translate(
								'During your {{em}}Quick Start{{/em}}, a Happiness Engineer will offer pro advice on everything you need to build a great site in the fastest way possible, like for example:',
								{
									components: { em: <em /> },
								}
							) }
						</p>
						<ul className="concierge-quickstart-session__checklist">
							<li className="concierge-quickstart-session__checklist-item">
								<Gridicon
									icon="checkmark"
									className="concierge-quickstart-session__checklist-item-icon"
								/>
								<span className="concierge-quickstart-session__checklist-item-text">
									{ translate( 'How to choose the right design for your site and audience.', {
										comment: "This is a benefit listed on a 'Purchase a call with us' page",
									} ) }
								</span>
							</li>
							<li className="concierge-quickstart-session__checklist-item">
								<Gridicon
									icon="checkmark"
									className="concierge-quickstart-session__checklist-item-icon"
								/>
								<span className="concierge-quickstart-session__checklist-item-text">
									{ translate(
										'How to customize your site with your branding, images, fonts, and colors.',
										{
											comment: "This is a benefit listed on a 'Purchase a call with us' page",
										}
									) }
								</span>
							</li>
							<li className="concierge-quickstart-session__checklist-item">
								<Gridicon
									icon="checkmark"
									className="concierge-quickstart-session__checklist-item-icon"
								/>
								<span className="concierge-quickstart-session__checklist-item-text">
									{ translate(
										'What content, text, and pages you should have in your site (and why).',
										{
											comment: "This is a benefit listed on a 'Purchase a call with us' page",
										}
									) }
								</span>
							</li>
							<li className="concierge-quickstart-session__checklist-item">
								<Gridicon
									icon="checkmark"
									className="concierge-quickstart-session__checklist-item-icon"
								/>
								<span className="concierge-quickstart-session__checklist-item-text">
									{ translate(
										'How to spread the word and get traffic, likes, and followers for your site.',
										{
											comment: "This is a benefit listed on a 'Purchase a call with us' page",
										}
									) }
								</span>
							</li>
							<li className="concierge-quickstart-session__checklist-item">
								<Gridicon
									icon="checkmark"
									className="concierge-quickstart-session__checklist-item-icon"
								/>
								<span className="concierge-quickstart-session__checklist-item-text">
									{ translate(
										'How to establish a solid foundation in your site to prevent headaches and problems.',
										{
											comment: "This is a benefit listed on a 'Purchase a call with us' page",
										}
									) }
								</span>
							</li>
						</ul>

						<p>
							{ translate(
								'The session will be tailored entirely to your needs. In the end, not only will you have answers to your questions but you will be 100x more effective on your way to the site you always dreamed!'
							) }
						</p>
						<p>
							<b>
								{ translate(
									'Book your {{em}}Quick Start{{/em}} session below at a special one-time price of {{del}}%(oldPrice)s{{/del}} %(price)s.',
									{
										components: { del: <del />, em: <em /> },
										args: {
											oldPrice: formatCurrency( fullCost, currencyCode, { stripZeros: true } ),
											price: productDisplayCost,
										},
									}
								) }
							</b>{ ' ' }
						</p>
						<p>
							{ receiptId
								? translate(
										'Please notice, this is a one-time offer because you just got a new plan and we want you to make the most out of it! Regular price for {{em}}Quick Start{{/em}} sessions is %(oldPrice)s.',
										{
											components: { b: <b />, em: <em /> },
											args: {
												oldPrice: formatCurrency( fullCost, currencyCode, { stripZeros: true } ),
											},
										}
								  )
								: '' }
						</p>
						<p>
							<em>
								{ translate(
									'Note: {{em}}Quick Start{{/em}} sessions are currently available only in English.',
									{
										components: { em: <em /> },
									}
								) }
							</em>
						</p>
					</div>
					<div className="concierge-quickstart-session__column-doodle">
						<img
							className="concierge-quickstart-session__doodle"
							alt="Website expert offering a support session"
							src="/calypso/images/illustrations/support.svg"
						/>
					</div>
				</div>
			</>
		);
	}

	footer() {
		const {
			translate,
			productDisplayCost,
			isLoggedIn,
			handleClickAccept,
			handleClickDecline,
		} = this.props;
		return (
			<footer className="concierge-quickstart-session__footer">
				{ ! isLoggedIn && (
					<Button
						primary
						className="concierge-quickstart-session__get-started-button"
						onClick={ () => handleClickAccept( 'get_started' ) }
					>
						{ translate( 'Get Started!' ) }
					</Button>
				) }
				{ isLoggedIn && (
					<>
						<Button
							data-e2e-button="decline"
							className="concierge-quickstart-session__decline-offer-button"
							onClick={ handleClickDecline }
						>
							{ translate( "No thanks, I'll do it on my own" ) }
						</Button>
						<Button
							primary
							className="concierge-quickstart-session__accept-offer-button"
							onClick={ () => handleClickAccept( 'accept' ) }
						>
							{ translate( 'Yes, I want a WordPress Expert by my side!', {
								args: {
									amount: productDisplayCost,
								},
							} ) }
						</Button>
					</>
				) }
			</footer>
		);
	}
}
