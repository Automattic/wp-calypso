import { formatNumber } from '@automattic/number-formatters';
import { useViewportMatch } from '@wordpress/compose';
import { __ } from '@wordpress/i18n';
import { useMemo } from 'react';
import { useLocale } from '../../../app/locale';
import { ActivityActor } from '../../../components/logs-activity/activity-actor';
import { ActivityEvent } from '../../../components/logs-activity/activity-event';
import { Activity } from '../../../components/logs-activity/types';
import { formatDateCell, getDateTimeLabel } from '../../logs/utils';
import { ManageBackupLink } from './manage-backup-link';
import type { ActivityLogGroupCountResponse, Site } from '@automattic/api-core';
import type { Field, Operator } from '@wordpress/dataviews';

export type ActivityLogTypeOption = {
	value: string;
	label: string;
};

type UseActivityFieldsArgs = {
	site: Site;
	activityLogTypes?: ActivityLogGroupCountResponse[ 'groups' ] | undefined;
} & (
	| {
			timezoneString: string;
			gmtOffset?: number;
	  }
	| {
			timezoneString?: undefined;
			gmtOffset: number;
	  }
);

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
	site,
	timezoneString,
	gmtOffset,
	activityLogTypes,
}: UseActivityFieldsArgs ): Field< Activity >[] {
	const locale = useLocale();
	const isLargeScreen = useViewportMatch( 'huge', '>=' );
	const dateTimeLabel = getDateTimeLabel( { timezoneString, gmtOffset, isLargeScreen } );
	const localIsUTC = gmtOffset === 0;
	// Inaccessible Jetpack sites can't open the backup detail route.
	const canManageBackups = ! site.__inaccessible_jetpack_error;

	return useMemo( () => {
		const activityLogTypeElements: ActivityLogTypeOption[] = Object.entries(
			activityLogTypes ?? {}
		)
			.map( ( [ value, { name, count } ] ) => ( {
				value,
				label: `${ name } (${ formatNumber( count ) })`,
			} ) )
			.sort( ( a, b ) => a.label.localeCompare( b.label ) );
		return [
			{
				id: 'published',
				type: 'datetime',
				label: dateTimeLabel,
				enableHiding: true,
				enableSorting: true,
				getValue: ( { item } ) => item.activityUnparsedTs,
				render: ( { item } ) => {
					const value = item.activityUnparsedTs;
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
							getValue: ( { item } ) => item.activityUnparsedTs,
							render: ( { item } ) => {
								const value = item.activityUnparsedTs;
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
						} as Field< Activity >,
					]
				: [] ),
			{
				id: 'event',
				type: 'text',
				label: __( 'Event' ),
				enableSorting: false,
				enableHiding: false,
				getValue: ( { item } ) => {
					return `${ item.activityTitle }: ${ item.activityDescription.textDescription }`;
				},
				render: ( { item } ) => {
					return (
						<ActivityEvent
							activity={ item }
							action={
								canManageBackups &&
								item.activityIsRewindable && <ManageBackupLink activity={ item } site={ site } />
							}
						/>
					);
				},
				filterBy: { operators: [] },
			},
			{
				id: 'actor',
				type: 'text',
				label: __( 'User' ),
				enableSorting: false,
				enableHiding: false,
				getValue: ( { item } ) => item.activityActor?.actorName || __( 'Unknown' ),
				render: ( { item } ) => <ActivityActor actor={ item.activityActor } />,
				filterBy: { operators: [] },
			},
			{
				id: 'activity_type',
				type: 'text',
				label: __( 'Activity type' ),
				enableSorting: false,
				getValue: ( { item } ) => getActivityLogTypeSlugFromName( item.activityName ),
				render: ( { item } ) => (
					<span>
						{ getActivityLogTypeDescriptionFromName( item.activityName, activityLogTypes ) }
					</span>
				),
				elements: activityLogTypeElements,
				filterBy: { operators: [ 'isAny' as Operator ] },
			},
		];
	}, [
		site,
		canManageBackups,
		timezoneString,
		gmtOffset,
		locale,
		dateTimeLabel,
		activityLogTypes,
		localIsUTC,
	] );
}
