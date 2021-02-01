/**
 * External dependencies
 */
import React, { PureComponent } from 'react';
import Gridicon from 'calypso/components/gridicon';

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

export class DifmUpsell extends PureComponent {
	render() {
		const { receiptId, translate } = this.props;

		const title = translate( 'Checkout ‹ "Built For You" offer', {
			comment: '"Checkout" is the part of the site where a user is preparing to make a purchase.',
		} );

		return (
			<>
				<PageViewTracker path="/checkout/:site/offer-difm/:receipt_id" title={ title } />
				<DocumentHead title={ title } />
				{ receiptId ? (
					<CompactCard className="difm-upsell__card-header">{ this.header() }</CompactCard>
				) : (
					''
				) }
				<CompactCard className="difm-upsell__card-body">{ this.body() }</CompactCard>
				<CompactCard className="difm-upsell__card-footer">{ this.footer() }</CompactCard>
			</>
		);
	}

	header() {
		const { translate } = this.props;

		return (
			<header className="difm-upsell__small-header">
				<Gridicon icon="checkmark-circle" className="difm-upsell__purchase-success-icon" />
				<div className="difm-upsell__title">
					<h2 className="difm-upsell__title-heading">
						{ translate( 'Congratulations on your purchase!' ) }
					</h2>
					<div className="difm-upsell__subtitle">
						{ translate( 'You will receive an email confirmation shortly.' ) }
					</div>
				</div>
			</header>
		);
	}

	body() {
		const { translate } = this.props;
		return (
			<>
				<h2 className="difm-upsell__header">
					{ translate(
						'Skip to the launch line: {{br/}} Let our WordPress experts build your website',
						{
							components: { br: <br /> },
						}
					) }
				</h2>

				<div className="difm-upsell__column-pane">
					<div className="difm-upsell__column-content">
						<p>
							{ translate(
								'Get up and running quickly by letting our WordPress experts build and design your website from scratch.'
							) }
						</p>
						<p>
							{ translate(
								'Whether you’re launching a store, a business, or even online courses, we’ll help you stand out online with a beautiful, functional, secure website that’s built just for you.'
							) }
						</p>
						<p>
							{ translate(
								'You’ll work with a dedicated engagement manager throughout the entire project, ensuring that your vision is carried through from start to finish. All for a one-time fee.'
							) }
						</p>
						<p>{ translate( 'Our premium website building service is perfect for:' ) }</p>
						<ul className="difm-upsell__checklist">
							<li className="difm-upsell__checklist-item">
								<Gridicon icon="checkmark" className="difm-upsell__checklist-item-icon" />
								<span className="difm-upsell__checklist-item-text">
									{ translate( 'Online stores', {
										comment:
											"This is a type of business listed on the 'Website building service' offer page",
									} ) }
								</span>
							</li>
							<li className="difm-upsell__checklist-item">
								<Gridicon icon="checkmark" className="difm-upsell__checklist-item-icon" />
								<span className="difm-upsell__checklist-item-text">
									{ translate( 'Educational websites', {
										comment:
											"This is a type of business listed on the 'Website building service' offer page",
									} ) }
								</span>
							</li>
							<li className="difm-upsell__checklist-item">
								<Gridicon icon="checkmark" className="difm-upsell__checklist-item-icon" />
								<span className="difm-upsell__checklist-item-text">
									{ translate( 'Professional services', {
										comment:
											"This is a type of business listed on the 'Website building service' offer page",
									} ) }
								</span>
							</li>
							<li className="difm-upsell__checklist-item">
								<Gridicon icon="checkmark" className="difm-upsell__checklist-item-icon" />
								<span className="difm-upsell__checklist-item-text">
									{ translate( 'Advanced tailored solutions', {
										comment:
											"This is a type of business listed on the 'Website building service' offer page",
									} ) }
								</span>
							</li>
						</ul>

						<p>
							{ translate(
								'Simply tell us a little bit more about your website, and we’ll get back to you in 2-3 business days.'
							) }
						</p>

						<p>
							{ translate( '{{b}}Custom websites starting at $4,900{{/b}}', {
								components: { b: <b /> },
							} ) }
						</p>
					</div>
					<div className="difm-upsell__column-doodle">
						<img
							className="difm-upsell__doodle"
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
			<footer className="difm-upsell__footer">
				<Button
					data-e2e-button="decline"
					className="difm-upsell__decline-offer-button"
					onClick={ handleClickDecline }
				>
					{ translate( 'No thanks' ) }
				</Button>
				<Button
					primary
					className="difm-upsell__accept-offer-button"
					onClick={ () => handleClickAccept( 'accept' ) }
				>
					{ translate( 'Yes, I want to apply now and get my site built' ) }
				</Button>
			</footer>
		);
	}
}
