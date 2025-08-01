import { useTranslate } from 'i18n-calypso';
import moment from 'moment';
import { useMemo, useCallback } from 'react';
import CopyToClipboardButton from 'calypso/a8c-for-agencies/components/copy-to-clipboard-button';
import { UpcomingEventProps } from 'calypso/a8c-for-agencies/components/upcoming-event/types';
import a4aLogo from 'calypso/assets/images/a8c-for-agencies/events/a4a-logo.svg';
import billingSystemEventImage from 'calypso/assets/images/a8c-for-agencies/events/billing-system-event-image.svg';
import vipComplimentImage from 'calypso/assets/images/a8c-for-agencies/events/vip-compliment-image.svg';
import vipLogo from 'calypso/assets/images/a8c-for-agencies/events/vip-logo.svg';
import wordcampUsEventImage from 'calypso/assets/images/a8c-for-agencies/events/wordcamp-us2025-image.svg';
import wpOrgLogo from 'calypso/assets/images/a8c-for-agencies/events/wporg-logo-green.svg';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

const WORDCAMP_US_2025_COUPON_CODE = 'automattic25';

export const useUpcomingEvents = () => {
	const translate = useTranslate();
	const localizedMoment = useLocalizedMoment();
	const dispatch = useDispatch();

	const handleWordCampUSClick = useCallback( () => {
		dispatch(
			recordTracksEvent( 'calypso_a4a_overview_events_wordcamp_us_2025_08_26_link_click' )
		);
	}, [ dispatch ] );

	const handleCopyWCUS2025DiscountCodeClick = useCallback( () => {
		dispatch(
			recordTracksEvent( 'calypso_a4a_overview_events_wordcamp_us_2025_08_26_discount_code_copy' )
		);
	}, [ dispatch ] );

	return useMemo( () => {
		const eventsData: UpcomingEventProps[] = [
			{
				id: 'vip-webinar-2025-08-21',
				date: {
					from: moment( '2025-08-21' ),
					to: moment( '2025-08-26' ),
				},
				displayDate: translate( 'Thursday, August 21, 1:00 pm CDT (6:00 PM UTC)' ),
				title: translate( 'Launched: The newest product solutions from WordPress VIP' ),
				subtitle: translate( 'WordPress VIP' ),
				descriptions: [
					translate(
						'Get a closer look at the newest solutions for our Open & Intelligent Experience Builder in this one-hour webinar with WordPress VIP CMO Anne-Marie Goulet and CTO Brian Alvey.'
					),
					translate(
						'After you register, help us spread the word about Launched 25.1 by using this {{a}}Partner Toolkit{{/a}}.',
						{
							components: {
								a: (
									<a
										href="https://docs.google.com/document/d/1_Pd3U6NkhK2_6P0d9tL4ydqLDMz31iXhbYdOaaUSFss/edit?tab=t.0"
										target="_blank"
										rel="noreferrer"
									/>
								),
							},
						}
					),
				],
				cta: {
					label: translate( 'Register for the webinar ↗' ),
					url: 'https://wpvip.com/event/launched-wordpress-vips-newest-product-solutions/?utm_source=partner_a4a&utm_medium=outbound&utm_campaign=2025_partner&utm_content=launched_webinar',
				},
				logoUrl: vipLogo,
				imageUrl: vipComplimentImage,
				trackEventName: 'calypso_a4a_overview_events_vip_webinar_2025_08_21_click',
				dateClassName: 'a4a-event__date--vip',
			},
			{
				id: 'billing-system-2025-08-06',
				date: {
					from: moment( '2025-08-06' ),
					to: moment( '2025-08-06' ),
				},
				title: translate( 'Phase 1 of our Billing System Enhancements Launch August 6' ),
				subtitle: translate( 'Automattic for Agencies' ),
				descriptions: [
					translate(
						"We're excited to announce that we're working towards supporting annual billing, 25 additional currencies, new payment methods, and more. We're achieving this by transitioning to a new billing system and will conduct the migration in 3 phases, starting with new client referrals in phase 1 on August 6th."
					),
					translate(
						"See what's changing and when by visiting our FAQ in the Knowledge Base. Questions? Reach out to our support team anytime."
					),
				],
				cta: {
					label: translate( 'Read the billing migration FAQ ↗' ),
					url: 'https://agencieshelp.automattic.com/knowledge-base/billing-migration-faq-for-agencies/',
				},
				logoUrl: a4aLogo,
				imageUrl: billingSystemEventImage,
				trackEventName: 'calypso_a4a_overview_events_billing_migration_faq_click',
				dateClassName: 'a4a-event__date--a4a',
				imageClassName: 'a4a-event__image--a4a a4a-event__image--billing-system',
			},
			{
				id: 'wordcamp-us-2025-08-26',
				date: {
					from: moment( '2025-08-26' ),
					to: moment( '2025-08-29' ),
				},
				title: translate( 'Join Automattic for Agencies at WordCamp US' ),
				subtitle: translate( 'Official sponsor' ),
				descriptions: [
					translate(
						"Automattic is a proud sponsor of {{a}}WordCamp US{{/a}} and we're excited to invite you and your team to this year's event—the premier gathering for digital agencies, innovators, and industry leaders. As a valued member of the Automattic for Agencies community, you'll enjoy inspiring keynotes, hands-on workshops, and unparalleled networking opportunities with peers and product experts.",
						{
							components: {
								a: (
									<a
										href="https://us.wordcamp.org/2025/"
										target="_blank"
										rel="noreferrer"
										onClick={ handleWordCampUSClick }
									/>
								),
							},
						}
					),
					translate(
						"As a leading agency, we'd love for you to join us and we're excited to offer you an exclusive {{b}}25% discount on registration{{/b}} for your team. Use coupon {{b}}automattic25{{/b}} during checkout.",
						{
							components: {
								b: <b />,
							},
						}
					),
				],
				logoUrl: wpOrgLogo,
				imageUrl: wordcampUsEventImage,
				trackEventName: 'calypso_a4a_overview_events_register_click_wordcamp_us_2025_08_26',
				dateClassName: 'a4a-event__date--wordcamp',
				imageClassName: 'a4a-event__image--wordcamp',
				cta: {
					label: translate( 'Register now ↗' ),
					url: 'https://us.wordcamp.org/2025/tickets',
				},
				extraContent: (
					<CopyToClipboardButton
						textToCopy={ WORDCAMP_US_2025_COUPON_CODE }
						label={ translate( 'Copy coupon code' ) }
						iconPosition="right"
						onClick={ handleCopyWCUS2025DiscountCodeClick }
					/>
				),
			},
		];

		return eventsData.filter( ( event ) => {
			const eventDate = event.date.to.clone().startOf( 'day' );
			const today = localizedMoment().startOf( 'day' );
			return eventDate.isSameOrAfter( today );
		} );
	}, [ handleCopyWCUS2025DiscountCodeClick, handleWordCampUSClick, localizedMoment, translate ] );
};
