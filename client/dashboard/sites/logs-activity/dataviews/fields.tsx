import { useViewportMatch } from '@wordpress/compose';
import { useMemo } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useLocale } from '../../../app/locale';
import { ActivityActor } from '../../../components/logs-activity/activity-actor';
import { ActivityEvent } from '../../../components/logs-activity/activity-event';
import { formatDateCell, getDateTimeLabel } from '../../logs/utils';
import type { SiteActivityLog } from '@automattic/api-core';
import type { Field } from '@wordpress/dataviews';

type UseActivityFieldsArgs =
	| { timezoneString: string; gmtOffset?: number }
	| { timezoneString?: undefined; gmtOffset: number };

export function useActivityFields( {
	timezoneString,
	gmtOffset,
}: UseActivityFieldsArgs ): Field< SiteActivityLog >[] {
	const locale = useLocale();
	const isLargeScreen = useViewportMatch( 'huge', '>=' );
	const dateTimeLabel = getDateTimeLabel( { timezoneString, gmtOffset, isLargeScreen } );

	return useMemo( () => {
		return [
			{
				id: 'published',
				type: 'datetime',
				label: dateTimeLabel,
				enableHiding: false,
				enableSorting: true,
				getValue: ( { item } ) => item.published,
				render: ( { item } ) => {
					const value = item.published;
					return <span>{ formatDateCell( { value, timezoneString, gmtOffset, locale } ) }</span>;
				},
				filterBy: { operators: [] },
			},
			{
				id: 'published_utc',
				type: 'datetime',
				label: __( 'Date & Time (UTC)' ),
				enableHiding: true,
				enableSorting: true,
				getValue: ( { item } ) => item.published,
				render: ( { item } ) => {
					const value = item.published;
					return (
						<span>
							{ formatDateCell( { value, timezoneString, gmtOffset, locale, formatAsUTC: true } ) }
						</span>
					);
				},
				filterBy: { operators: [] },
			},
			{
				id: 'event',
				type: 'text',
				label: __( 'Event' ),
				enableSorting: false,
				getValue: ( { item } ) => `${ item.summary }: ${ item.content?.text ?? '' }`,
				render: ( { item } ) => (
					<ActivityEvent
						summary={ item.summary }
						content={ item.content }
						gridicon={ item.gridicon }
					/>
				),
				filterBy: { operators: [] },
			},
			{
				id: 'actor',
				type: 'text',
				label: __( 'User' ),
				enableSorting: false,
				getValue: ( { item } ) => item.actor?.name || __( 'Unknown' ),
				render: ( { item } ) => <ActivityActor actor={ item.actor } />,
				filterBy: { operators: [] },
			},
		];
	}, [ timezoneString, gmtOffset, locale, dateTimeLabel ] );
}
