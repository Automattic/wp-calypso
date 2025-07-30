import { useTranslate } from 'i18n-calypso';
import moment from 'moment';
import { useMemo, useCallback } from 'react';
import CopyToClipboardButton from 'calypso/a8c-for-agencies/components/copy-to-clipboard-button';
import { UpcomingEventProps } from 'calypso/a8c-for-agencies/components/upcoming-event/types';
import a4aEventImage from 'calypso/assets/images/a8c-for-agencies/events/a4a-compliment-image.svg';
import a4aLogo from 'calypso/assets/images/a8c-for-agencies/events/a4a-logo.svg';
import billingSystemEventImage from 'calypso/assets/images/a8c-for-agencies/events/billing-system-event-image.svg';
import wooEventImage from 'calypso/assets/images/a8c-for-agencies/events/woo-compliment-image.svg';
import wooLogo from 'calypso/assets/images/a8c-for-agencies/events/woo-logo.svg';
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
				id: 'woo-2025-07-14',
				date: {
					from: moment( '2025-07-14' ),
					to: moment( '2025-07-14' ),
				},
				title: translate( 'How are you preparing for the busiest time of year?' ),
				subtitle: translate( 'Woo and Automattic for Agencies' ),
				descriptions: [
					translate(
						"As peak selling season approaches, Woo and Automattic for Agencies are conducting a survey to better understand how agencies are preparing for the busiest time of year. The insights gathered will inform actionable recommendations for Woo merchants and will be featured in upcoming thought leadership content on both Woo's website and the Automattic for Agencies blog."
					),
					translate(
						'{{b}}Select agencies may also be highlighted as thought leaders in these publications, showcasing your expertise to a wider audience.{{/b}}',
						{
							components: {
								b: <b />,
							},
						}
					),
				],
				cta: {
					label: translate( 'Share your insights ↗' ),
					url: 'https://2yp7yqymm1z.typeform.com/to/YC4Yw2VI',
				},
				logoUrl: wooLogo,
				imageUrl: wooEventImage,
				trackEventName: 'calypso_a4a_overview_events_register_click_woo_marketing_2025_07_14',
				dateClassName: 'a4a-event__date--woo',
				imageClassName: 'a4a-event__image--woo',
			},
			{
				id: 'a4a-2025-07-25',
				date: {
					from: moment( '2025-07-25' ),
					to: moment( '2025-07-25' ),
				},
				title: translate( 'Automattic for Agencies Partner Empowerment Survey' ),
				subtitle: translate( 'Automattic for Agencies' ),
				descriptions: [
					translate(
						"Participate in the Automattic for Agencies Partner Empowerment Survey and directly influence the training and resources we develop to better support your agency's success with WordPress and Automattic products. Your feedback is essential in helping us understand your needs and identify opportunities for improvement."
					),
					translate(
						'{{b}}Share your insights by July 25th{{/b}} and play a key role in shaping our future offerings. Together, we can ensure that our programs and resources are tailored to help your agency thrive!',
						{
							components: {
								b: <b />,
							},
						}
					),
				],
				cta: {
					label: translate( 'Share your insights ↗' ),
					url: 'https://automattic.survey.fm/automattic-for-agencies-partner-empowerment-survey',
				},
				logoUrl: a4aLogo,
				imageUrl: a4aEventImage,
				trackEventName: 'calypso_a4a_overview_events_register_click_a4a_2025_07_25',
				dateClassName: 'a4a-event__date--a4a',
				imageClassName: 'a4a-event__image--a4a',
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
