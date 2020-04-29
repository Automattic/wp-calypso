/**
 * External dependencies
 */
import React, { PureComponent } from 'react';
import formatCurrency from '@automattic/format-currency';

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

export class WhiteGlove extends PureComponent {
	render() {
		const { receiptId, translate } = this.props;

		const title = translate( 'Checkout ‹ White Glove', {
			comment: '"Checkout" is the part of the site where a user is preparing to make a purchase.',
		} );

		return (
			<>
				<PageViewTracker path="/checkout/offer-white-glove/:site" title={ title } />
				<DocumentHead title={ title } />
				{ receiptId ? (
					<CompactCard className="white-glove__card-header">{ this.header() }</CompactCard>
				) : (
					''
				) }
				<CompactCard className="white-glove__card-body">{ this.body() }</CompactCard>
				<CompactCard className="white-glove__card-footer">{ this.footer() }</CompactCard>
			</>
		);
	}

	header() {
		const { translate } = this.props;

		return (
			<header className="white-glove__small-header">
				<h2 className="white-glove__title">
					{ translate( 'Hold tight, your site is being upgraded.' ) }
				</h2>
			</header>
		);
	}

	body() {
		const { translate, planRawPrice, planDiscountedRawPrice, currencyCode } = this.props;
		const bundleValue = planRawPrice * 77;

		return (
			<>
				<h2 className="white-glove__header">
					{ translate( 'Get White Glove support!', {
						args: {
							bundleValue: formatCurrency( bundleValue, currencyCode, { precision: 0 } ),
							discountPrice: formatCurrency( planDiscountedRawPrice, currencyCode, {
								precision: 0,
							} ),
						},
						components: { u: <u />, br: <br /> },
					} ) }
				</h2>

				<div className="white-glove__column-pane">
					<div className="white-glove__column-content">
						<p>
							{ translate( 'Get access to world class support, and a Business plan. ', {
								components: { b: <b /> },
							} ) }
						</p>

						<p>
							{ translate(
								'Give the White Glove service a risk-free test drive with our {{u}}30-day Money Back Guarantee{{/u}}.',
								{
									components: { u: <u /> },
								}
							) }
						</p>
					</div>
					<div className="white-glove__column-doodle">
						<img
							className="white-glove__doodle"
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
			<footer className="white-glove__footer">
				<Button className="white-glove__decline-offer-button" onClick={ handleClickDecline }>
					{ translate( "No thanks, I'll stick with the free site" ) }
				</Button>
				<Button
					primary
					className="white-glove__accept-offer-button"
					onClick={ () => handleClickAccept( 'accept' ) }
				>
					{ translate( "Yes, I'd love to try it out!" ) }
				</Button>
			</footer>
		);
	}
}
