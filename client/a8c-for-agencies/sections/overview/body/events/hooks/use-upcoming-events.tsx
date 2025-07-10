import { useTranslate } from 'i18n-calypso';
import moment from 'moment';
import { useMemo } from 'react';
import { UpcomingEventProps } from 'calypso/a8c-for-agencies/components/upcoming-event/types';
import a4aEventImage from 'calypso/assets/images/a8c-for-agencies/events/a4a-compliment-image.svg';
import a4aLogo from 'calypso/assets/images/a8c-for-agencies/events/a4a-logo.svg';
import wooEventImage from 'calypso/assets/images/a8c-for-agencies/events/woo-compliment-image.svg';
import wooLogo from 'calypso/assets/images/a8c-for-agencies/events/woo-logo.svg';
import { useLocalizedMoment } from 'calypso/components/localized-moment';

export const useUpcomingEvents = () => {
	const translate = useTranslate();
	const localizedMoment = useLocalizedMoment();

	return useMemo( () => {
		const eventsData: UpcomingEventProps[] = [
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
		];

		return eventsData.filter( ( event ) => {
			const eventDate = event.date.to.clone().startOf( 'day' );
			const today = localizedMoment().startOf( 'day' );
			return eventDate.isSameOrAfter( today );
		} );
	}, [ localizedMoment, translate ] );
};
