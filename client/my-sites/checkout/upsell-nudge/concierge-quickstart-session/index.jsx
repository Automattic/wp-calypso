import { CompactCard, Button } from '@automattic/components';
import { PureComponent } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import ExternalLink from 'calypso/components/external-link';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { localizeUrl } from 'calypso/lib/i18n-utils';
import { SUPPORT_ROOT } from 'calypso/lib/url/support';

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
		const { translate } = this.props;

		return (
			<>
				<h4 className="concierge-quickstart-session__sub-header">
					{ translate( 'Quick Start sessions are no longer available for purchase' ) }
				</h4>

				<div>
					<p>
						{ translate(
							'We are sorry, but we are no longer offering Quick Start sessions on WordPress.com.'
						) }
					</p>

					<p>
						{ translate(
							'If you are looking for help, or you are just looking for ways to learn more about your site, please take a look at the following resources:'
						) }
					</p>

					<ul className="concierge-quickstart-session__resource-list">
						<li>
							<a href={ localizeUrl( 'https://wordpress.com/webinars/' ) }>
								{ translate( 'WordPress.com Webinars' ) }
							</a>
						</li>
						<li>
							<ExternalLink icon href="https://wpcourses.com">
								{ translate( 'WordPress.com Courses' ) }
							</ExternalLink>
						</li>
						<li>
							<a href={ SUPPORT_ROOT }>{ translate( 'WordPress.com Support' ) }</a>
						</li>
					</ul>
				</div>
			</>
		);
	}

	footer() {
		const { handleClickDecline, translate } = this.props;

		return (
			<footer className="concierge-quickstart-session__footer">
				<Button
					primary
					className="concierge-quickstart-session__no-offer-button"
					onClick={ handleClickDecline }
				>
					{ translate( 'Thanks for the update' ) }
				</Button>
			</footer>
		);
	}
}
