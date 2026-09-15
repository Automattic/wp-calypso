import { Icon, __experimentalHStack as HStack } from '@wordpress/components';
import { __, _n, sprintf } from '@wordpress/i18n';
import clsx from 'clsx';
import ActivityDescription from 'calypso/components/activity-card/activity-description';
import JetpackLogo from 'calypso/components/jetpack-logo';
import { gridiconToWordPressIcon } from 'calypso/dashboard/utils/gridicons';
import { applySiteOffset } from 'calypso/lib/site/timezone';
import type { ActivityActorOption, ActivityLogEntry, ActivityTypeGroup } from './types';
import type { Field, Operator } from '@wordpress/dataviews';
import type { MomentInput, Moment } from 'moment';

type MomentFactory = ( input?: MomentInput ) => Moment;

export type FieldsOptions = {
	moment: MomentFactory;
	timezone: string | null;
	gmtOffset: number | null;
	groupTypes: ActivityTypeGroup[];
	actorOptions: ActivityActorOption[];
	showFilters: boolean;
};

export function getFields( {
	moment,
	timezone,
	gmtOffset,
	groupTypes,
	actorOptions,
	showFilters,
}: FieldsOptions ): Field< ActivityLogEntry >[] {
	const toLocal = ( ts: number ) => applySiteOffset( moment( ts ), { timezone, gmtOffset } );

	const formatDate = ( ts: number ) => {
		const local = toLocal( ts );
		const now = applySiteOffset( moment(), { timezone, gmtOffset } );
		const daysAgo = now.clone().startOf( 'day' ).diff( local.clone().startOf( 'day' ), 'days' );

		// Within the last week moment's calendar() gives localized strings like
		// "Today at 3:53 PM" or "Last Monday at 3:53 PM"; beyond that it falls
		// back to plain dates, so switch to relative phrasing instead.
		return daysAgo < 7 ? local.calendar( now ) : moment( ts ).fromNow();
	};

	const fields: Field< ActivityLogEntry >[] = [
		{
			id: 'date',
			label: __( 'Date & time' ),
			getValue: ( { item } ) => item.activityTs,
			render: ( { item } ) => (
				<time
					className="activity-log-dataviews__date"
					title={ toLocal( item.activityTs ).format( 'llll' ) }
				>
					{ formatDate( item.activityTs ) }
				</time>
			),
		},
		{
			id: 'event',
			label: __( 'Event' ),
			getValue: ( { item } ) => item.activityTitle,
			enableGlobalSearch: true,
			render: ( { item } ) => {
				const streamCount = item.streamCount ?? item.streams?.length ?? 0;

				return (
					<HStack alignment="left" spacing={ 3 }>
						<span
							className={ clsx( 'activity-log-dataviews__icon-box', {
								'is-error': item.activityStatus === 'error',
								'is-warning': item.activityStatus === 'warning',
							} ) }
						>
							<Icon
								icon={ gridiconToWordPressIcon( item.activityIcon ?? 'info-outline' ) }
								size={ 20 }
								className="activity-log-dataviews__icon"
							/>
						</span>
						<span className="activity-log-dataviews__event-text">
							<strong>{ item.activityTitle }</strong>
							{ item.activityDescription && (
								<span className="activity-log-dataviews__event-description">
									{ ' ' }
									<ActivityDescription activity={ item } />
								</span>
							) }
							{ streamCount > 0 && (
								<span className="activity-log-dataviews__stream-count">
									{ ' ' }
									{ sprintf(
										/* translators: %d is the number of similar events grouped into this row */
										_n( '· %d more event', '· %d more events', streamCount ),
										streamCount
									) }
								</span>
							) }
						</span>
					</HStack>
				);
			},
		},
		{
			id: 'user',
			label: __( 'User' ),
			getValue: ( { item } ) => item.actorName ?? '',
			enableGlobalSearch: true,
			render: ( { item } ) => {
				const isJetpackActor =
					item.actorType === 'Application' && !! item.actorName?.startsWith( 'Jetpack' );
				const isMultipleActors = item.actorType === 'Multiple';

				return (
					<span className="activity-log-dataviews__user">
						{ isJetpackActor && (
							<JetpackLogo
								size={ 24 }
								monochrome={ false }
								className="activity-log-dataviews__user-logo"
							/>
						) }
						{ ! isJetpackActor && ! isMultipleActors && item.actorAvatarUrl && (
							<img
								className="activity-log-dataviews__user-avatar"
								src={ item.actorAvatarUrl }
								alt=""
								width={ 24 }
								height={ 24 }
							/>
						) }
						<span>{ isMultipleActors ? __( 'Multiple users' ) : item.actorName }</span>
					</span>
				);
			},
		},
	];

	if ( showFilters ) {
		fields.push(
			{
				id: 'group',
				label: __( 'Activity type' ),
				getValue: ( { item } ) => item.activityGroup ?? '',
				elements: groupTypes.map( ( type ) => ( {
					value: type.key,
					label: `${ type.name } (${ type.count })`,
				} ) ),
				filterBy: { operators: [ 'isAny' as Operator ] },
				enableSorting: false,
			},
			{
				id: 'actor',
				label: __( 'Performed by' ),
				getValue: ( { item } ) => item.actorName ?? '',
				elements: actorOptions.map( ( actor ) => ( {
					value: actor.key,
					label: actor.name,
				} ) ),
				filterBy: { operators: [ 'isAny' as Operator ] },
				enableSorting: false,
			}
		);
	}

	return fields;
}
