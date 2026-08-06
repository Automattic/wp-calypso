import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import moment from 'moment';
import { useMemo } from 'react';
import { A4A_MARKETPLACE_HOSTING_PRESSABLE_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import { UpcomingEventProps } from 'calypso/a8c-for-agencies/components/upcoming-event/types';
import usePressableOwnershipType from 'calypso/a8c-for-agencies/sections/marketplace/hosting-overview/hooks/use-pressable-ownership-type';
import PressableLogo from 'calypso/assets/images/a8c-for-agencies/events/pressable-logo.svg';
import WordCampAsia2026Image from 'calypso/assets/images/a8c-for-agencies/events/wordcamp-asia2026-compliment-image.svg';
import WordCampAsia2026Logo from 'calypso/assets/images/a8c-for-agencies/events/wordcamp-asia2026-image.svg';
import WordCampUS2026Logo from 'calypso/assets/images/a8c-for-agencies/events/wordcamp-us2026-image.webp';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { useSelector } from 'calypso/state';
import { getActiveAgency } from 'calypso/state/a8c-for-agencies/agency/selectors';

export const useUpcomingEvents = () => {
	const translate = useTranslate();
	const localizedMoment = useLocalizedMoment();

	const agency = useSelector( getActiveAgency );

	const pressableOwnership = usePressableOwnershipType();

	const shouldShowPressablePromoOffer =
		agency?.billing_system === 'billingdragon' && pressableOwnership !== 'agency';

	return useMemo( () => {
		const eventsData: UpcomingEventProps[] = [
			{
				id: 'a4a-wordcamp-us-2026-08-16',
				date: {
					from: moment( '2026-08-16' ),
					to: moment( '2026-08-19' ),
				},
				displayDate: translate( 'August 16th–19th · Phoenix, Arizona' ),
				title: translate( 'Meet us at WordCamp US 2026' ),
				subtitle: translate( 'Automattic for Agencies' ),
				descriptions: [
					translate(
						'The teams behind WordPress.com, Woo, Jetpack, Pressable, and WordPress VIP are heading to Phoenix, and our agency partners get the inside track.'
					),
					translate(
						'Save 25% on your WordCamp ticket with code {{code}}AGENCY25{{/code}}, then join us after hours at Automattic Connect for real talk and good company with our teams, customers, and fellow developers.',
						{
							components: {
								code: <code />,
							},
						}
					),
				],
				ctas: [
					{
						variant: 'primary',
						label: translate( 'Get 25% off tickets' ),
						url: 'https://us.wordcamp.org/2026/tickets/',
						isExternal: true,
						trackEventName: 'calypso_a4a_overview_events_wordcamp_us_2026_tickets_click',
					},
					{
						variant: 'secondary',
						label: translate( 'Join Automattic Connect' ),
						url: 'https://luma.com/icioyddp?tk=sigiZu',
						isExternal: true,
						trackEventName: 'calypso_a4a_overview_events_wordcamp_us_2026_automattic_connect_click',
					},
				],
				logoUrl: WordCampUS2026Logo,
				dateClassName: 'a4a-event__date--wordcamp',
			},
			{
				id: 'a4a-wordcamp-2026-event-2026-02-17',
				date: {
					from: moment( '2026-04-09' ),
					to: moment( '2026-04-11' ),
				},
				title: translate( 'Join Automattic for Agencies at WordCamp Asia' ),
				subtitle: translate( 'Official sponsor' ),
				descriptions: [
					translate(
						'WordCamp Asia 2026 is happening April 9–11 in Mumbai, India, and our Automattic for Agencies team would love to see you there. If you haven’t already, {{PassLink}}grab your pass for the event{{/PassLink}} and book your stay in one of the {{HotelLink}}official hotel blocks{{/HotelLink}} for the best rates!',
						{
							components: {
								PassLink: (
									<Button
										variant="link"
										href="https://asia.wordcamp.org/2026/event-pass"
										target="_blank"
									/>
								),
								HotelLink: (
									<Button
										variant="link"
										href="https://asia.wordcamp.org/2026/official-hotels/"
										target="_blank"
									/>
								),
							},
						}
					),
				],
				ctas: [
					{
						variant: 'secondary',
						label: translate( 'Register now' ),
						url: 'https://asia.wordcamp.org/2026/',
						trackEventName: 'calypso_a4a_overview_events_a4a_wordcamp_asia_2026_register_click',
						isExternal: true,
					},
				],
				logoUrl: WordCampAsia2026Logo,
				imageUrl: WordCampAsia2026Image,
				imageClassName: 'a4a-event__image--wordcamp-2026',
				dateClassName: 'a4a-event__date--critical',
			},
			...( shouldShowPressablePromoOffer
				? [
						{
							id: 'a4a-pressable-promo-offer-2026-q3',
							date: {
								from: moment( '2026-08-11' ),
								to: moment( '2026-09-30' ),
							},
							title: translate(
								'Limited time offer: Get up to 6 months of free Pressable hosting on new plans!'
							),
							subtitle: translate( 'Automattic for Agencies & Pressable' ),
							descriptions: [
								translate(
									'Enjoy up to 6 months free on Pressable Signature and Premium Plans with Automattic for Agencies. Choose annual billing for 6 months free or monthly billing for 3 months free, while still earning revenue share and reseller incentives.'
								),
							],
							ctas: [
								{
									variant: 'primary',
									label: translate( 'View promo details' ),
									url: A4A_MARKETPLACE_HOSTING_PRESSABLE_LINK,
									trackEventName:
										'calypso_a4a_overview_events_a4a_pressable_promo_offer_q3_2026_view_promo_details_click',
								},
								{
									variant: 'secondary',
									label: translate( 'See full terms' ),
									url: 'https://pressable.com/legal/hosting-promotion-terms/',
									isExternal: true,
									trackEventName:
										'calypso_a4a_overview_events_a4a_pressable_promo_offer_q3_2026_see_full_terms_click',
								},
							],
							logoUrl: PressableLogo,
							dateClassName: 'a4a-event__date--a4a',
						},
				  ]
				: [] ),
		];

		return eventsData.filter( ( event ) => {
			const eventDate = event.date.to.clone().startOf( 'day' );
			const today = localizedMoment().startOf( 'day' );
			return eventDate.isSameOrAfter( today );
		} );
	}, [ localizedMoment, shouldShowPressablePromoOffer, translate ] );
};
