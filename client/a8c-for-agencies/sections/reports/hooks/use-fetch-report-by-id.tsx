import { useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { useSelector } from 'calypso/state';
import { getActiveAgencyId } from 'calypso/state/a8c-for-agencies/agency/selectors';
import type { ReportFormData } from '../types';

const mockData: ReportFormData = {
	blog_id: 123456789,
	timeframe: '30_days',
	client_email: [ 'client@example.com', 'client2@example.com' ],
	start_date: '2024-01-01',
	end_date: '2024-01-31',
	send_copy_to_team: true,
	teammate_emails: [ 'teammate1@agency.com', 'teammate2@agency.com' ],
	custom_intro_text: 'Here is your monthly report with key insights and performance metrics.',
	stats_items: {
		total_traffic: true,
		top_pages: true,
		top_devices: false,
		top_locations: true,
		device_breakdown: true,
		total_traffic_all_time: false,
		most_popular_time_of_day: true,
		most_popular_day_of_week: true,
	},
};

export default function useFetchReportById( reportId: number | null ) {
	const agencyId = useSelector( getActiveAgencyId );

	return useQuery( {
		queryKey: [ 'a4a-report', agencyId, reportId ],
		queryFn: async () => {
			return wpcom.req.get( {
				apiNamespace: 'wpcom/v2',
				path: `/agency/${ agencyId }/reports/${ reportId }`,
			} );
		},
		// TODO: Remove this once the API is ready
		select: ( data ) => {
			return {
				...data,
				form_data: mockData,
			};
		},
		enabled: !! agencyId && !! reportId,
		refetchOnWindowFocus: false,
		retry: ( failureCount ) => {
			return failureCount < 3;
		},
	} );
}
