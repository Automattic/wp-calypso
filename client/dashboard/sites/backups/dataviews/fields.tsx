import { Icon } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { FormattedTime } from '../../../components/formatted-time';
import { gridiconToWordPressIcon } from '../../../utils/gridicons';
import type { ActivityLogEntry, ActivityLogGroupCountResponse } from '@automattic/api-core';
import type { Field, Operator } from '@wordpress/dataviews';

const getActivityLogTypeSlugFromName = ( name?: string ): string => {
	if ( ! name ) {
		return '';
	}
	const [ group ] = name.split( '__' );
	return group ?? name;
};

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

export function getFields(
	activityLogTypes?: ActivityLogGroupCountResponse[ 'groups' ],
	timezoneString?: string,
	gmtOffset?: number
): Field< ActivityLogEntry >[] {
	const activityLogTypeElements = activityLogTypes
		? Object.entries( activityLogTypes )
				.map( ( [ value, { name } ] ) => {
					// Override "Backups and Restores" (rewind) to just "Backups" for backup list context
					const displayName = value === 'rewind' ? __( 'Backups' ) : name;
					return {
						value,
						label: `${ displayName }`,
					};
				} )
				.sort( ( a, b ) => a.label.localeCompare( b.label ) )
		: [];
	return [
		{
			id: 'icon',
			label: __( 'Icon' ),
			enableSorting: false,
			render: ( { item } ) => (
				<Icon
					icon={ gridiconToWordPressIcon( item.gridicon ) }
					size={ 32 }
					className="dashboard-backups__list-icon"
				/>
			),
		},
		{
			id: 'title',
			label: __( 'Title' ),
			getValue: ( { item } ) => {
				// translators: %s is the name of the person who performed the action
				const actor = item.actor?.name ? ` ${ sprintf( __( 'by %s' ), item.actor.name ) }` : '';
				return item.summary + actor;
			},
			enableGlobalSearch: true,
		},
		{
			id: 'date',
			label: __( 'Date' ),
			getValue: ( { item } ) => {
				return item.published || item.last_published;
			},
			render: ( { item } ) => (
				<FormattedTime
					timestamp={ item.published || item.last_published }
					timezoneString={ timezoneString }
					gmtOffset={ gmtOffset }
				/>
			),
		},
		{
			id: 'content_text',
			label: __( 'Content' ),
			getValue: ( { item } ) => item.content.text,
			enableGlobalSearch: true,
		},
		{
			id: 'activity_type',
			label: __( 'Type' ),
			getValue: ( { item } ) => getActivityLogTypeSlugFromName( item.name ),
			render: ( { item } ) => (
				<span>{ getActivityLogTypeDescriptionFromName( item.name, activityLogTypes ) }</span>
			),
			elements: activityLogTypeElements,
			enableHiding: false,
			enableSorting: false,
			filterBy: { operators: [ 'isAny' as Operator ] },
		},
	];
}
