import { DefaultError, useMutation } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';

export interface TicketMigrationData {
	intents: string[];
	otherDetails: string;
}

interface ApiResponse {
	success: boolean;
}

const setMigration = (
	siteSlug: string,
	{ intents, otherDetails }: TicketMigrationData
): Promise< ApiResponse > => {
	return wpcom.req.post(
		{
			path: `/sites/${ siteSlug }/automated-migration/wpcom-survey`,
			apiNamespace: 'wpcom/v2',
		},
		{},
		{
			intents,
			other_details: otherDetails,
		}
	);
};

export const useMigrationTicketMutation = ( siteSlug: string ) => {
	return useMutation< ApiResponse, DefaultError, TicketMigrationData >( {
		mutationKey: [ 'create-migration-ticket', siteSlug ],
		mutationFn: ( { intents, otherDetails } ) =>
			setMigration( siteSlug, { intents, otherDetails } ),
	} );
};
