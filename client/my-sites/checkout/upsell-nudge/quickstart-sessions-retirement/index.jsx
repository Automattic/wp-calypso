import { CompactCard, Button, ExternalLink } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { SUPPORT_ROOT } from '@automattic/urls';
import { useTranslate } from 'i18n-calypso';
import DocumentHead from 'calypso/components/data/document-head';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import {
	CONCIERGE_QUICKSTART_SESSION,
	CONCIERGE_SUPPORT_SESSION,
} from 'calypso/my-sites/checkout/upsell-nudge';

import './style.scss';

export const QuickstartSessionsRetirement = ( props ) => {
	const translate = useTranslate();

	const { handleClickDecline, isLoggedIn, receiptId, siteSlug, upsellType } = props;

	const getPageViewTrackerPath = () => {
		if ( upsellType === CONCIERGE_QUICKSTART_SESSION ) {
			if ( receiptId ) {
				return '/checkout/offer-quickstart-session/:receipt_id/:site';
			}

			if ( siteSlug ) {
				return '/checkout/offer-quickstart-session/:site';
			}

			return '/checkout/offer-quickstart-session';
		}

		if ( upsellType === CONCIERGE_SUPPORT_SESSION ) {
			if ( receiptId ) {
				return '/checkout/offer-support-session/:receipt_id/:site';
			}

			return '/checkout/offer-support-session/:site';
		}

		return null;
	};

	const title = translate( 'Checkout ‹ Quick Start Session', {
		comment: '"Checkout" is the part of the site where a user is preparing to make a purchase.',
	} );

	const pageViewTrackerPath = getPageViewTrackerPath();

	return (
		<div className="quickstart-sessions-retirement">
			{ pageViewTrackerPath && (
				<PageViewTracker
					path={ pageViewTrackerPath }
					title={ title }
					properties={ { is_logged_in: isLoggedIn } }
				/>
			) }
			<DocumentHead title={ title } />

			{ receiptId ? (
				<CompactCard className="quickstart-sessions-retirement__card-header">
					<header className="quickstart-sessions-retirement__header">
						<h2 className="quickstart-sessions-retirement__title">
							{ translate( 'Hold tight, your site is being upgraded.' ) }
						</h2>
					</header>
				</CompactCard>
			) : null }

			<CompactCard className="quickstart-sessions-retirement__card-body">
				<h4 className="quickstart-sessions-retirement__sub-header">
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

					<ul className="quickstart-sessions-retirement__resource-list">
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
							<a href={ localizeUrl( SUPPORT_ROOT ) }>{ translate( 'WordPress.com Support' ) }</a>
						</li>
					</ul>
				</div>
			</CompactCard>

			<CompactCard className="quickstart-sessions-retirement__card-footer">
				<footer className="quickstart-sessions-retirement__footer">
					<Button
						primary
						className="quickstart-sessions-retirement__thank-you-button"
						onClick={ handleClickDecline }
					>
						{ translate( 'Thanks for the update' ) }
					</Button>
				</footer>
			</CompactCard>
		</div>
	);
};
