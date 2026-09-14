/**
 * Multipart upload to `POST /agency/<id>/media` with
 * `asset_type=agent_media`. The `asset_type` param switches the server to a
 * UUID filename; `partner_directory_logo` instead yields a predictable,
 * overwriting name. Both return the normalized payload below.
 * Backend rules: jpeg/png only, 10 MB max, field name `media`.
 */
import { useMutation, type UseMutationOptions } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { useSelector } from 'calypso/state';
import { getActiveAgencyId } from 'calypso/state/a8c-for-agencies/agency/selectors';

export interface UploadAgentMediaResponse {
	asset_type: string;
	attachment_id: number;
	url: string;
	mime: string;
	width: number;
	height: number;
}

export const uploadAgentMedia = (
	agencyId: number,
	file: File
): Promise< UploadAgentMediaResponse > =>
	new Promise( ( resolve, reject ) => {
		wpcom.req.post(
			{
				apiNamespace: 'wpcom/v2',
				path: `/agency/${ agencyId }/media`,
				formData: [
					[ 'media', file ],
					[ 'asset_type', 'agent_media' ],
				],
			},
			( error: Error | null, response: UploadAgentMediaResponse ) => {
				if ( error ) {
					reject( error );
					return;
				}
				resolve( response );
			}
		);
	} );

type Options = UseMutationOptions< UploadAgentMediaResponse, Error, File >;

export default function useUploadAgentMedia( options?: Options ) {
	const agencyId = useSelector( getActiveAgencyId );

	return useMutation< UploadAgentMediaResponse, Error, File >( {
		...options,
		mutationFn: ( file ) => {
			if ( ! agencyId ) {
				throw new Error( 'useUploadAgentMedia: missing agencyId' );
			}
			return uploadAgentMedia( agencyId, file );
		},
	} );
}
