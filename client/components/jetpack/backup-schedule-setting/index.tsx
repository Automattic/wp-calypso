import { Card } from '@automattic/components';
import { useQueryClient } from '@tanstack/react-query';
import { SelectControl } from '@wordpress/components';
import { TranslateResult, useTranslate } from 'i18n-calypso';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import useScheduledTimeMutation from 'calypso/data/jetpack-backup/use-scheduled-time-mutation';
import useScheduledTimeQuery from 'calypso/data/jetpack-backup/use-scheduled-time-query';
import { applySiteOffset } from 'calypso/lib/site/timezone';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import getSiteGmtOffset from 'calypso/state/selectors/get-site-gmt-offset';
import getSiteTimezoneValue from 'calypso/state/selectors/get-site-timezone-value';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { convertHourToRange } from './utils';
import type { FunctionComponent } from 'react';
import './style.scss';

const BackupScheduleSetting: FunctionComponent = () => {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const queryClient = useQueryClient();
	const moment = useLocalizedMoment();
	const siteId = useSelector( getSelectedSiteId ) as number;
	const timezone = useSelector( ( state ) => getSiteTimezoneValue( state, siteId ) );
	const gmtOffset = useSelector( ( state ) => getSiteGmtOffset( state, siteId ) );

	const generateTimeSlots = (): { label: string; value: string }[] => {
		const options = [];
		for ( let hour = 0; hour < 24; hour++ ) {
			const utcTime = moment.utc().startOf( 'day' ).hour( hour );
			const localTime =
				timezone && gmtOffset
					? applySiteOffset( utcTime, { timezone, gmtOffset } )
					: utcTime.local();
			const localHour = localTime.hour();
			const timeRange = convertHourToRange( moment, localHour );

			options.push( {
				label: timeRange,
				value: hour.toString(),
				localHour, // for sorting
			} );
		}

		// Sort options by local hour before returning
		options.sort( ( a, b ) => a.localHour - b.localHour );

		// Remove the localHour from the final result as it's not needed anymore
		return options.map( ( { label, value } ) => ( { label, value } ) );
	};

	const timeSlotOptions = generateTimeSlots();
	const { isFetching: isScheduledTimeQueryFetching, data } = useScheduledTimeQuery( siteId );
	const { isPending: isScheduledTimeMutationLoading, mutate: scheduledTimeMutate } =
		useScheduledTimeMutation( {
			onSuccess: ( data, variables ) => {
				const { scheduledHour } = variables;

				queryClient.invalidateQueries( { queryKey: [ 'jetpack-backup-scheduled-time', siteId ] } );
				dispatch(
					successNotice( translate( 'Daily backup time successfully changed.' ), {
						duration: 5000,
						isPersistent: true,
					} )
				);

				dispatch(
					recordTracksEvent( 'calypso_jetpack_backup_schedule_update', {
						scheduled_hour: scheduledHour,
					} )
				);
			},
			onError: () => {
				dispatch(
					errorNotice( translate( 'Update daily backup time failed. Please, try again.' ), {
						duration: 5000,
						isPersistent: true,
					} )
				);
			},
		} );

	const isLoading = isScheduledTimeQueryFetching || isScheduledTimeMutationLoading;

	const updateScheduledTime = ( selectedTime: string ) => {
		scheduledTimeMutate( { scheduledHour: Number( selectedTime ) } );
	};

	const getScheduleInfoMessage = (): TranslateResult => {
		const hour = data?.scheduledHour || 0;
		const range = convertHourToRange( moment, hour, true );

		const scheduledBy =
			! data || ! data.scheduledBy
				? translate( 'Currently using default time.' )
				: translate( 'Time set by %(scheduledBy)s.', {
						args: { scheduledBy: data.scheduledBy },
				  } );

		const utcInfo = translate( 'UTC (%(timeRange)s) is used as the base timezone.', {
			args: {
				timeRange: range,
			},
			comment: '%(timeRange)s is a time range, such as 10:00-10:59.',
		} );

		return `${ scheduledBy } ${ utcInfo }`;
	};

	return (
		<div id="backup-schedule" className="backup-schedule-setting">
			<Card compact className="setting-title">
				<h3>{ translate( 'Daily backup time schedule' ) }</h3>
			</Card>
			<Card className="setting-content">
				<p>
					{ translate(
						'Pick a timeframe for your backup to run. Some site owners prefer scheduling backups at specific times for better control.'
					) }
				</p>
				<SelectControl
					disabled={ isLoading }
					options={ timeSlotOptions }
					value={ data?.scheduledHour?.toString() || '' }
					help={ getScheduleInfoMessage() }
					onChange={ updateScheduledTime }
					__nextHasNoMarginBottom
				/>
			</Card>
		</div>
	);
};

export default BackupScheduleSetting;
