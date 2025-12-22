import { useTranslate } from 'i18n-calypso';
import moment from 'moment';
import { useMemo } from 'react';
import A4ALogo from 'calypso/a8c-for-agencies/components/a4a-logo';
import { UpcomingEventProps } from 'calypso/a8c-for-agencies/components/upcoming-event/types';
import WooLogo from 'calypso/assets/images/a8c-for-agencies/events/woo-logo.svg';
import { useLocalizedMoment } from 'calypso/components/localized-moment';

export const useUpcomingEvents = () => {
	const translate = useTranslate();
	const localizedMoment = useLocalizedMoment();

	return useMemo( () => {
		const eventsData: UpcomingEventProps[] = [
			{
				id: 'a4a-woo-2025-12-23',
				date: {
					from: moment( '2025-12-23' ),
					to: moment( '2026-01-05' ),
				},
				displayDate: translate( 'As soon as possible' ),
				title: translate( 'Action Needed: Critical WooCommerce Update Available' ),
				subtitle: translate( 'Automattic for Agencies' ),
				descriptions: [
					translate(
						'A vulnerability has been identified in WooCommerce versions 8.1 through 10.4.2, and a patch is now available. Client sites hosted with Automattic are already protected. For any client sites hosted elsewhere, please update WooCommerce to the latest version as soon as possible. At this time, we have no indication that this vulnerability has been exploited.'
					),
				],
				cta: {
					label: translate( 'Read the announcement and FAQ ↗' ),
					url: 'https://usabi.li/do/b8fc6strv3hm/tnzgph',
				},
				logoUrl: WooLogo,
				trackEventName: 'calypso_a4a_overview_events_a4a_woo_2025_12_23_click',
				dateClassName: 'a4a-event__date--critical',
			},
			{
				id: 'a4a-partner-survey-2025-12-03',
				date: {
					from: moment( '2026-01-01' ),
					to: moment( '2026-01-01' ),
				},
				displayDate: translate( 'Open until January 1, 2026' ),
				title: translate( 'Automattic for Agencies Partner Survey' ),
				subtitle: translate( 'Automattic for Agencies' ),
				descriptions: [
					translate(
						'We invite you to share your input in our short Automattic for Agencies Partner Survey. Your feedback will help us better understand your experience with Automattic for Agencies and the products you use across our ecosystem. The survey is anonymous, and your insights will guide how we shape next year’s incentives, tools, and product improvements to create more value for your agency and clients.'
					),
				],
				cta: {
					label: translate( 'Take the survey now! ↗' ),
					url: 'https://usabi.li/do/b8fc6strv3hm/tnzgph',
				},
				logoElement: <A4ALogo size={ 64 } />,
				trackEventName: 'calypso_a4a_overview_events_a4a_partner_survey_2025_12_03_click',
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
