/**
 * External dependencies
 */
import React, { PureComponent } from 'react';

/**
 * Internal dependencies
 */
import { CompactCard, Button } from '@automattic/components';
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

export class PlanWithDomainUpgrade extends PureComponent {
	render() {
		const { receiptId, translate } = this.props;

		const title = translate( 'Checkout ‹ Plan Upgrade', {
			comment: '"Checkout" is the part of the site where a user is preparing to make a purchase.',
		} );

		return (
			<>
				<PageViewTracker path="/checkout/offer-plan-with-domain/:site" title={ title } />
				<DocumentHead title={ title } />
				{ receiptId ? (
					<CompactCard className="plan-with-domain__card-header">{ this.header() }</CompactCard>
				) : (
					''
				) }
				<CompactCard className="plan-with-domain__card-body">{ this.body() }</CompactCard>
				<CompactCard className="plan-with-domain__card-footer">{ this.footer() }</CompactCard>
			</>
		);
	}

	header() {
		const { translate } = this.props;

		return (
			<header className="plan-with-domain__small-header">
				<h2 className="plan-with-domain__title">
					{ translate( 'Hold tight, your site is being upgraded.' ) }
				</h2>
			</header>
		);
	}

	body() {
		const { translate } = this.props;

		return (
			<>
				<h2 className="plan-with-domain__header">
					{ translate( 'You need to buy a WordPress.com plan to buy your domain!' ) }
				</h2>

				<div className="plan-with-domain__column-pane">
					<div className="plan-with-domain__column-content">
						<p>
							{ translate( "You want that domain, don't you? Then purchase a plan right now!!" ) }
						</p>

						<p>
							{ translate(
								'Give our plans a risk-free test drive with our {{u}}30-day Money Back Guarantee{{/u}}.',
								{
									components: { u: <u /> },
								}
							) }
						</p>
					</div>
					<div className="plan-with-domain__column-doodle">
						<img
							className="plan-with-domain__doodle"
							alt="Website expert offering a support session"
							src={ premiumThemesImage }
						/>
					</div>
				</div>
			</>
		);
	}

	footer() {
		const { siteSlug, translate, handleClickAccept, handleClickDecline } = this.props;
		const redirectPath = `/start/plan-only?siteSlug=${ siteSlug }`;

		return (
			<footer className="plan-with-domain__footer">
				<Button
					className="plan-with-domain__decline-offer-button"
					onClick={ () => handleClickDecline( true, true ) }
				>
					{ translate( "No thanks, I'll stick with a free domain" ) }
				</Button>
				<Button
					primary
					className="plan-with-domain__accept-offer-button"
					onClick={ () => handleClickAccept( 'accept', redirectPath ) }
				>
					{ translate( 'Yes, I want that domain right now!' ) }
				</Button>
			</footer>
		);
	}
}
