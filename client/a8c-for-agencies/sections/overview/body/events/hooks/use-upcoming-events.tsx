import { useTranslate } from 'i18n-calypso';
import moment from 'moment';
import { useMemo } from 'react';
import { UpcomingEventProps } from 'calypso/a8c-for-agencies/components/upcoming-event/types';
import klaviyoEventImage from 'calypso/assets/images/a8c-for-agencies/events/klaviyo-compliment-image.svg';
import klaviyoLogo from 'calypso/assets/images/a8c-for-agencies/events/klaviyo-logo.svg';
import wooEventImage from 'calypso/assets/images/a8c-for-agencies/events/woo-compliment-image.svg';
import wooLogo from 'calypso/assets/images/a8c-for-agencies/events/woo-logo.svg';
import { useLocalizedMoment } from 'calypso/components/localized-moment';

export const useUpcomingEvents = () => {
	const translate = useTranslate();
	const localizedMoment = useLocalizedMoment();

	return useMemo( () => {
		const eventsData: UpcomingEventProps[] = [
			{
				id: 'klaviyo-woocommerce-2025-06-12',
				date: {
					from: moment( '2025-06-12' ),
					to: moment( '2025-06-12' ),
				},
				title: translate( 'Grow your agency with Klaviyo and WooCommerce' ),
				subtitle: translate( 'Automattic for Agencies / Klaviyo webinar' ),
				descriptions: [
					translate(
						"Learn how to leverage Klaviyo’s marketing tools with WooCommerce to grow your clients’ stores. Guided by industry experts, explore seamless integration and effective strategies designed to enhance your agency's ability to drive client success."
					),
				],
				cta: {
					label: translate( 'Register for free ↗' ),
					url: 'https://us02web.zoom.us/webinar/register/4117473222555/WN_tp0MS84_TYyp4NP9XMmRfQ#/registration',
				},
				logoUrl: klaviyoLogo,
				imageUrl: klaviyoEventImage,
				trackEventName: 'calypso_a4a_overview_events_register_click_klaviyo_woocommerce_2025_06_12',
				dateClassName: 'a4a-event__date--klaviyo',
				imageClassName: 'a4a-event__image--klaviyo',
			},
			{
				id: 'woo-marketing-2025-06-25',
				date: {
					from: moment( '2025-06-25' ),
					to: moment( '2025-06-25' ),
				},
				title: translate( "You're invited to Step Inside: Woo Marketing" ),
				subtitle: translate( 'Woo Marketing + Automattic for Agencies event' ),
				descriptions: [
					translate(
						"Woo is extending an invitation to Automattic for Agencies partners to join a live conversation with CMO Tamara Niesen and VP Customer Marketing Mahrie Boyle about WooCommerce's future marketing direction. Learn about the recent brand refresh, upcoming 2025 advertising campaigns, demand generation, and how Woo plans to collaborate closely with the community to grow the ecosystem."
					),
				],
				cta: {
					label: translate( 'Register for free ↗' ),
					url: 'https://developer.woocommerce.com/youre-invited-to-step-inside-woo-marketing/',
				},
				logoUrl: wooLogo,
				imageUrl: wooEventImage,
				trackEventName: 'calypso_a4a_overview_events_register_click_woo_marketing_2025_06_25',
				dateClassName: 'a4a-event__date--woo',
				imageClassName: 'a4a-event__image--woo',
			},
		];

		return eventsData.filter( ( event ) => {
			const eventDate = event.date.to.clone().startOf( 'day' );
			const today = localizedMoment().startOf( 'day' );
			return eventDate.isSameOrAfter( today );
		} );
	}, [ localizedMoment, translate ] );
};
