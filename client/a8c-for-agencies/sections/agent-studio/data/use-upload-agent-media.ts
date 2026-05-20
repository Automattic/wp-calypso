/**
 * Multipart file upload to `POST /wpcom/v2/agency/<agency_id>/a4a/media`.
 *
 * The endpoint stores the file on `a8cforagenciesportfolio.wordpress.com`
 * with a random UUID filename and returns `{ attachment_id, url, mime,
 * width, height }`. The returned `url` is what we thread into the run
 * input as `logo_url`, `partner_logo_url`, `hero_url`, or an entry of
 * `image_urls[]`.
 *
 * Backend rules:
 *   - JPEG and PNG only
 *   - 10 MB max
 *   - Field name must be `media`
 *
 * We can't go through `wpcom.req` JSON helpers — they serialize the body
 * as JSON. The `formData` option on `wpcom.req.post` supports multipart
 * (mirrors the pattern in `client/blocks/reader-import-button`), so we
 * use that.
 */
import { useMutation, type UseMutationOptions } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { useSelector } from 'calypso/state';
import { getActiveAgencyId } from 'calypso/state/a8c-for-agencies/agency/selectors';

export interface UploadAgentMediaResponse {
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
				path: `/agency/${ agencyId }/a4a/media`,
				formData: [ [ 'media', file ] ],
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
