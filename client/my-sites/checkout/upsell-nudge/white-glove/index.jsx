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
import WordPressLogo from 'components/wordpress-logo';
import Checklist from './checklist';

/**
 * Style dependencies
 */
import './style.scss';

/**
 * Image dependencies
 */

export class WhiteGlove extends PureComponent {
	render() {
		const title = 'Checkout ‹ White Glove';

		return (
			<>
				<PageViewTracker path="/checkout/:site/offer-white-glove" title={ title } />
				<DocumentHead title={ title } />

				<CompactCard className="white-glove__card-header">{ this.header() }</CompactCard>

				<CompactCard className="white-glove__card-body">{ this.body() }</CompactCard>
				<CompactCard className="white-glove__card-footer">{ this.footer() }</CompactCard>
			</>
		);
	}

	header() {
		const { planRawPrice, currencyCode } = this.props;

		const productPrice = formatCurrency( planRawPrice, currencyCode, { precision: 0 } );

		return (
			<header className="white-glove__header">
				<div className="white-glove__header-logo-container">
					<WordPressLogo className="white-glove__header-logo" size={ 32 } />
				</div>
				<h2>{ `White Glove Service for ${ productPrice }.` }</h2>
			</header>
		);
	}

	body() {
		return (
			<>
				<div className="white-glove__column-pane">
					<div className="white-glove__column-content">
						<p>
							You want a beautiful, functional, personalized website. And we’re here to help you
							create one with live, hands-on support from a WordPress expert. Here’s what you’ll
							get.
						</p>
					</div>
					<div className="white-glove__column-doodle">
						<img
							className="white-glove__doodle"
							alt="Website expert offering a support session"
							src="/calypso/images/people/he-image402x.png"
						/>
					</div>
				</div>

				<div className="white-glove__benefits">
					<Checklist content="Two thirty minute sessions with your very own WordPress experts" />
					<Checklist content="A free upgrade to our most popular Business Plan" />
					<Checklist content="Access to hundreds of themes and plugins" />
				</div>

				<div className="white-glove__column-pane">
					<div className="white-glove__content-right">
						More support. More customization. Our White Glove Service lets you take control. We’ll
						show you how.
					</div>
				</div>
			</>
		);
	}

	footer() {
		const { handleClickAccept, handleClickDecline } = this.props;
		return (
			<footer className="white-glove__footer">
				<Button
					className="white-glove__accept-offer-button"
					onClick={ () => handleClickAccept( 'accept' ) }
				>
					Buy now
				</Button>

				<Button
					className="white-glove__decline-offer-button"
					onClick={ handleClickDecline }
					borderless
				>
					No thanks, continue &rsaquo;
				</Button>
			</footer>
		);
	}
}
