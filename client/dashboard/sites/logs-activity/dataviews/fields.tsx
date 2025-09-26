import { useViewportMatch } from '@wordpress/compose';
import { useMemo } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useLocale } from '../../../app/locale';
import { ActivityActor } from '../../../components/logs-activity/activity-actor';
import { ActivityEvent } from '../../../components/logs-activity/activity-event';
import { formatDateCell, getDateTimeLabel } from '../../logs/utils';
import type { SiteActivityLog, ActivityLogGroupCountResponse } from '@automattic/api-core';
import type { Field, Operator } from '@wordpress/dataviews';

export type ActivityLogTypeOption = {
	value: string;
	label: string;
};

type UseActivityFieldsArgs =
	| {
			timezoneString: string;
			gmtOffset?: number;
			activityLogTypes?: ActivityLogGroupCountResponse[ 'groups' ] | undefined;
	  }
	| {
			timezoneString?: undefined;
			gmtOffset: number;
			activityLogTypes?: ActivityLogGroupCountResponse[ 'groups' ] | undefined;
	  };

const getActivityLogTypeSlugFromName = ( name?: string ): string => {
	if ( ! name ) {
		return '';
	}
	const [ group ] = name.split( '__' );
	return group ?? '';
};

/**
 * Relies on the ActivityLogTypes to retrieve the actual description of the type, falls back on just the slug if not found.
 */
const getActivityLogTypeDescriptionFromName = (
	name?: string,
	activityLogTypes?: ActivityLogGroupCountResponse[ 'groups' ] | undefined
): string => {
	if ( ! name ) {
		return '';
	}
	const slug = getActivityLogTypeSlugFromName( name );
	return activityLogTypes?.[ slug ]?.name ?? slug;
};

export function useActivityFields( {
	timezoneString,
	gmtOffset,
	activityLogTypes,
}: UseActivityFieldsArgs ): Field< SiteActivityLog >[] {
	const locale = useLocale();
	const isLargeScreen = useViewportMatch( 'huge', '>=' );
	const dateTimeLabel = getDateTimeLabel( { timezoneString, gmtOffset, isLargeScreen } );
	const localIsUTC = gmtOffset === 0;

	const activityLogTypeElements = useMemo< ActivityLogTypeOption[] >( () => {
		if ( ! activityLogTypes ) {
			return [];
		}

		return Object.entries( activityLogTypes )
			.map( ( [ value, { name, count } ] ) => ( {
				value,
				label: `${ name } (${ count })`,
			} ) )
			.sort( ( a, b ) => a.label.localeCompare( b.label ) );
	}, [ activityLogTypes ] );

	return useMemo( () => {
		return [
			{
				id: 'published',
				type: 'datetime',
				label: dateTimeLabel,
				enableHiding: true,
				enableSorting: true,
				getValue: ( { item } ) => item.published,
				render: ( { item } ) => {
					const value = item.published;
					return <span>{ formatDateCell( { value, timezoneString, gmtOffset, locale } ) }</span>;
				},
				filterBy: { operators: [] },
			},
			...( ! localIsUTC
				? [
						{
							id: 'published_utc',
							type: 'datetime',
							label: __( 'Date & time (UTC)' ),
							enableHiding: true,
							enableSorting: true,
							getValue: ( { item } ) => item.published,
							render: ( { item } ) => {
								const value = item.published;
								return (
									<span>
										{ formatDateCell( {
											value,
											timezoneString,
											gmtOffset,
											locale,
											formatAsUTC: true,
										} ) }
									</span>
								);
							},
							filterBy: { operators: [] },
						} as Field< SiteActivityLog >,
				  ]
				: [] ),
			{
				id: 'event',
				type: 'text',
				label: __( 'Event' ),
				enableSorting: false,
				enableHiding: false,
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
				enableHiding: false,
				getValue: ( { item } ) => item.actor?.name || __( 'Unknown' ),
				render: ( { item } ) => <ActivityActor actor={ item.actor } />,
				filterBy: { operators: [] },
			},
			{
				id: 'activity_type',
				type: 'text',
				label: __( 'Activity type' ),
				getValue: ( { item } ) => getActivityLogTypeSlugFromName( item.name ),
				render: ( { item } ) => (
					<span>{ getActivityLogTypeDescriptionFromName( item.name, activityLogTypes ) }</span>
				),
				elements: activityLogTypeElements,
				isVisible: () => false,
				filterBy: { operators: [ 'isAny' as Operator ] },
			},
		];
	}, [
		timezoneString,
		gmtOffset,
		locale,
		dateTimeLabel,
		activityLogTypeElements,
		activityLogTypes,
		localIsUTC,
	] );
}
