import { useMultisiteUpdateScheduleQuery } from 'calypso/data/plugins/use-update-schedules-query';

export const useLoadScheduleFromId = ( id: string ) => {
	const { data: schedules, isFetched = [] } = useMultisiteUpdateScheduleQuery( true );

	const schedule = schedules?.find( ( schedule ) => schedule.id === id );
	// Make sure the sites are loaded, otherwise we pass undefined for the initial data
	const scheduleLoaded = isFetched && schedule?.sites?.every( ( site ) => site.ID );
	const scheduleNotFound = ! schedule && isFetched;

	return { schedule, scheduleLoaded, scheduleNotFound };
};
