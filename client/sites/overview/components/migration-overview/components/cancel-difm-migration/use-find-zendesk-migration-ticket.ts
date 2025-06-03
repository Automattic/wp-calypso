import { useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { SiteId } from 'calypso/types';

interface ZendeskMigrationTicketResponse {
	ticket_id: string;
	status: string;
	created_at: string;
	updated_at: string;
}

const findZendeskMigrationTicket = async (
	siteId: SiteId
): Promise< ZendeskMigrationTicketResponse > => {
	return wpcom.req.get( {
		path: `/sites/${ siteId }/automated-migration/find-ticket`,
		apiNamespace: 'wpcom/v2',
	} );
};

export const useFindZendeskMigrationTicket = ( siteId: SiteId, enabled: boolean ) => {
	return useQuery( {
		queryKey: [ 'zendesk-migration-ticket', siteId ],
		queryFn: () => findZendeskMigrationTicket( siteId ),
		enabled: !! siteId && enabled,
	} );
};
