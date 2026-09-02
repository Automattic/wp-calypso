import { Icon, __experimentalHStack as HStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import ActivityDescription from 'calypso/components/activity-card/activity-description';
import JetpackLogo from 'calypso/components/jetpack-logo';
import { gridiconToWordPressIcon } from 'calypso/dashboard/utils/gridicons';
import { applySiteOffset } from 'calypso/lib/site/timezone';
import type { BackupActivity } from './types';
import type { Field } from '@wordpress/dataviews';
import type { MomentInput, Moment } from 'moment';

type MomentFactory = ( input?: MomentInput ) => Moment;

export type FieldsOptions = {
	moment: MomentFactory;
	timezone: string | null;
	gmtOffset: number | null;
};

export function getFields( {
	moment,
	timezone,
	gmtOffset,
}: FieldsOptions ): Field< BackupActivity >[] {
	const formatDate = ( ts: number ) => {
		const local = applySiteOffset( moment( ts ), { timezone, gmtOffset } );
		const now = applySiteOffset( moment(), { timezone, gmtOffset } );
		const daysAgo = now.clone().startOf( 'day' ).diff( local.clone().startOf( 'day' ), 'days' );

		// Within the last week moment's calendar() gives localized strings like
		// "Today at 3:53 PM" or "Last Monday at 3:53 PM"; beyond that it falls
		// back to plain dates, so switch to relative phrasing instead.
		return daysAgo < 7 ? local.calendar( now ) : moment( ts ).fromNow();
	};

	return [
		{
			id: 'date',
			label: __( 'Date & time' ),
			getValue: ( { item } ) => item.activityTs,
			render: ( { item } ) => (
				<time
					className="backup-dataviews__date"
					title={ applySiteOffset( moment( item.activityTs ), { timezone, gmtOffset } ).format(
						'llll'
					) }
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
			render: ( { item } ) => (
				<HStack alignment="left" spacing={ 3 }>
					<span className="backup-dataviews__icon-box">
						<Icon
							icon={ gridiconToWordPressIcon( item.activityIcon ?? 'cloud' ) }
							size={ 20 }
							className="backup-dataviews__icon"
						/>
					</span>
					<span className="backup-dataviews__event-text">
						<strong>{ item.activityTitle }</strong>
						{ item.activityDescription && (
							<span className="backup-dataviews__event-description">
								{ ' ' }
								<ActivityDescription activity={ item } />
							</span>
						) }
					</span>
				</HStack>
			),
		},
		{
			id: 'user',
			label: __( 'User' ),
			getValue: ( { item } ) => item.actorName ?? '',
			enableGlobalSearch: true,
			render: ( { item } ) => {
				const isJetpackActor =
					item.actorType === 'Application' && !! item.actorName?.startsWith( 'Jetpack' );

				return (
					<span className="backup-dataviews__user">
						{ isJetpackActor ? (
							<JetpackLogo
								size={ 24 }
								monochrome={ false }
								className="backup-dataviews__user-logo"
							/>
						) : (
							item.actorAvatarUrl && (
								<img
									className="backup-dataviews__user-avatar"
									src={ item.actorAvatarUrl }
									alt=""
									width={ 24 }
									height={ 24 }
								/>
							)
						) }
						<span>{ item.actorName }</span>
					</span>
				);
			},
		},
	];
}
