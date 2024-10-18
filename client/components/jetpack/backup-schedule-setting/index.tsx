import { Card } from '@automattic/components';
import { useQueryClient } from '@tanstack/react-query';
import { SelectControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import useScheduledTimeMutation from 'calypso/data/jetpack-backup/use-scheduled-time-mutation';
import useScheduledTimeQuery from 'calypso/data/jetpack-backup/use-scheduled-time-query';
import { useDispatch, useSelector } from 'calypso/state';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import type { FunctionComponent } from 'react';
import './style.scss';

// Helper function to generate all time slots
const generateTimeSlots = (): { label: string; value: string }[] => {
	const options = [];
	for ( let hour = 0; hour < 24; hour++ ) {
		const period = hour < 12 ? 'AM' : 'PM';
		const adjustedHour = hour % 12 || 12;

		const startTime = `${ adjustedHour }:00`;
		const endTime = `${ adjustedHour }:59 ${ period }`;

		options.push( {
			label: `${ startTime } - ${ endTime }`,
			value: hour.toString(),
		} );
	}
	return options;
};

const BackupScheduleSetting: FunctionComponent = () => {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const options = generateTimeSlots();
	const queryClient = useQueryClient();

	const siteId = useSelector( getSelectedSiteId ) as number;
	const { isFetching: isScheduledTimeQueryFetching, data } = useScheduledTimeQuery( siteId );
	const { isPending: isScheduledTimeMutationLoading, mutate: scheduledTimeMutate } =
		useScheduledTimeMutation( {
			onSuccess: () => {
				queryClient.invalidateQueries( { queryKey: [ 'jetpack-backup-scheduled-time', siteId ] } );
				dispatch(
					successNotice( translate( 'Daily backup time successfully changed.' ), {
						duration: 5000,
						isPersistent: true,
					} )
				);
			},
			onError: () => {
				dispatch(
					errorNotice( translate( 'Update daily backup time. Please, try again.' ), {
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
		if ( ! data || data.scheduledBy === undefined || data.scheduledBy === 0 ) {
			return translate( 'Default time' );
		}
		return translate( 'Time set by %(scheduledBy)s', {
			args: { scheduledBy: data.scheduledBy },
		} );
	};

	return (
		<div id="backup-schedule" className="backup-schedule-setting">
			<Card compact className="setting-title">
				<h3>{ translate( 'Backup schedule' ) }</h3>
			</Card>
			<Card className="setting-content">
				<p>
					{ translate(
						'Pick a timeframe for your backup to run. Some site owners prefer scheduling backups at specific times for better control.'
					) }
				</p>
				<SelectControl
					disabled={ isLoading }
					options={ options }
					value={ data?.scheduledHour?.toString() || '' }
					help={ getScheduleInfoMessage() }
					onChange={ updateScheduledTime }
				/>
			</Card>
		</div>
	);
};

export default BackupScheduleSetting;
