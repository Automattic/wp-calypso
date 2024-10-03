import { DefaultError, useMutation } from '@tanstack/react-query';

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
	// eslint-disable-next-line no-console
	console.log( 'setMigration', siteSlug, intents, otherDetails );
	return Promise.resolve( { success: true } );
};

export const useMigrationTicketMutation = ( siteSlug: string ) => {
	return useMutation< ApiResponse, DefaultError, TicketMigrationData >( {
		mutationKey: [ 'create-migration-ticket', siteSlug ],
		mutationFn: ( { intents, otherDetails } ) =>
			setMigration( siteSlug, { intents, otherDetails } ),
	} );
};
