import { useTranslate } from 'i18n-calypso';
import moment from 'moment';
import { useMemo } from 'react';
import { UpcomingEventProps } from 'calypso/a8c-for-agencies/components/upcoming-event/types';
import avalaraLogo from 'calypso/assets/images/a8c-for-agencies/events/avalara-logo.svg';
import pressableLogo from 'calypso/assets/images/a8c-for-agencies/events/pressable-logo.svg';
import { useLocalizedMoment } from 'calypso/components/localized-moment';

export const useUpcomingEvents = () => {
	const translate = useTranslate();
	const localizedMoment = useLocalizedMoment();

	return useMemo( () => {
		const eventsData: UpcomingEventProps[] = [
			{
				id: 'pressable-webinar-2025-11-06',
				date: {
					from: moment( '2025-11-06' ),
					to: moment( '2025-11-06' ),
				},
				displayDate: translate( 'Thursday, November 6, 9:00-10:00 AM PT (4:00-5:00 PM UTC)' ),
				title: translate( 'The Pressable advantage for Automattic for Agencies partners' ),
				subtitle: translate( 'Automattic for Agencies and Pressable' ),
				descriptions: [
					translate(
						"Ready to scale your agency without stretching your team thin? Join us for an exclusive live session where we'll reveal how top-performing agencies are using Pressable and Automattic for Agencies to drive faster client growth, increase recurring revenue, and hit year-end goals effortlessly."
					),
				],
				cta: {
					label: translate( 'Reserve your spot ↗' ),
					url: 'https://us06web.zoom.us/webinar/register/WN_fUSevVhfRDOP-j7f-L-V2g',
				},
				logoUrl: pressableLogo,
				trackEventName: 'calypso_a4a_overview_events_pressable_webinar_2025_11_06_click',
				dateClassName: 'a4a-event__date--neutral',
			},
			{
				id: 'avalara-webinar-2025-11-12',
				date: {
					from: moment( '2025-11-12' ),
					to: moment( '2025-11-12' ),
				},
				displayDate: translate( 'Wednesday, November 12, 9:00-10:00 AM PT (4:00-5:00 PM UTC)' ),
				title: translate(
					'Global Trade & Tariff Shifts: Empowering Agencies to Navigate Compliance for WooCommerce Merchants'
				),
				subtitle: translate( 'Automattic for Agencies and our trusted partner, Avalara' ),
				descriptions: [
					translate(
						'Is your agency ready to guide WooCommerce merchants through the evolving maze of international trade taxes and tariffs? Recent regulatory shifts are creating compliance headaches for global ecommerce sellers. Without expert insights, your clients risk costly fines, delays, and lost revenue.'
					),
					translate( 'Join our exclusive webinar to gain a competitive edge.' ),
				],
				cta: {
					label: translate( 'Register for the webinar ↗' ),
					url: 'https://event.on24.com/wcc/r/5101931/BB47ACD15628777E39129D43586D1C96',
				},
				logoUrl: avalaraLogo,
				trackEventName: 'calso_a4a_overview_events_avalara_webinar_2025_11_12_click',
				dateClassName: 'a4a-event__date--neutral',
			},
		];

		return eventsData.filter( ( event ) => {
			const eventDate = event.date.to.clone().startOf( 'day' );
			const today = localizedMoment().startOf( 'day' );
			return eventDate.isSameOrAfter( today );
		} );
	}, [ localizedMoment, translate ] );
};
