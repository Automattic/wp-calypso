import { useMutation } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';

interface ImportBlueprintParams {
	blueprint: string;
	siteId: number;
}

interface ImportBlueprintResponse {
	importId: string;
}

const importBlueprintRequest = async ( {
	blueprint,
	siteId,
}: ImportBlueprintParams ): Promise< ImportBlueprintResponse > => {
	const importStatus = {
		importStatus: 'importer-ready-for-upload',
		siteId,
		type: 'wordpress',
	};

	const formData = [
		[ 'importStatus', JSON.stringify( importStatus ) ],
		[ 'blueprint', blueprint ],
	];

	return new Promise< ImportBlueprintResponse >( ( resolve, reject ) => {
		wpcom.req.post(
			{
				path: `/sites/${ siteId }/imports/library/new`,
				formData,
			},
			{ apiVersion: '1.1' },
			( error: Error | null, data: ImportBlueprintResponse ) => {
				if ( error ) {
					reject( error );
				} else {
					resolve( data );
				}
			}
		);
	} );
};

export const useImportBlueprint = () => {
	return useMutation( {
		mutationKey: [ 'import-blueprint' ],
		mutationFn: importBlueprintRequest,
	} );
};
