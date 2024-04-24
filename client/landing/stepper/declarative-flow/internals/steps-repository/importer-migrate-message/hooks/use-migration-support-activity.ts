import { useQuery } from '@tanstack/react-query';
import wpcomRequest from 'wpcom-proxy-request';

const ACTIVE_STATUSES = [ 'New', 'Open', 'Hold' ];
interface SupportActivity {
	id: number;
	status: string;
	subject: string;
	timestamp: number;
	channel: string;
}

export const useMigrationSupportActivity = ( site = '' ) => {
	return useQuery( {
		queryKey: [ 'help-support-activity' ],
		queryFn: () =>
			wpcomRequest< SupportActivity[] >( {
				path: 'support-activity',
				apiNamespace: 'wpcom/v2/',
				apiVersion: '2',
			} ),
		refetchOnWindowFocus: false,
		refetchOnMount: true,
		enabled: Boolean( site.length ),
		select: ( activities ) => {
			return activities.filter(
				( activity ) =>
					activity.subject.includes( 'Migration' ) &&
					activity.subject.includes( site ) &&
					ACTIVE_STATUSES.includes( activity.status )
			);
		},
		staleTime: Infinity,
		meta: {
			persist: false,
		},
	} );
};
